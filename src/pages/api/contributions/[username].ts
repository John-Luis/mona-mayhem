import type { APIRoute } from 'astro';

export const prerender = false;

const GITHUB_USERNAME_PATTERN = /^(?!.*--)[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const CONTRIBUTION_WEEKS = 52;
const CACHE_CONTROL = 'public, max-age=300';

interface UpstreamContributionDay {
	weekday: number;
	count: number;
	level: number;
}

interface UpstreamContributionWeek {
	first_day: string;
	contribution_days: UpstreamContributionDay[];
}

interface UpstreamContributionData {
	total_contributions: number;
	weeks: UpstreamContributionWeek[];
}

interface ContributionDay {
	date: string;
	count: number;
	level: number;
}

interface ContributionWeek {
	days: ContributionDay[];
}

interface ContributionResponse {
	username: string;
	total: number;
	weeks: ContributionWeek[];
}

const jsonResponse = (body: object, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Cache-Control': CACHE_CONTROL,
			'Content-Type': 'application/json',
		},
	});

const isValidDate = (value: string) => {
	const date = new Date(`${value}T00:00:00Z`);
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime());
};

const isUpstreamContributionData = (value: unknown): value is UpstreamContributionData => {
	if (!value || typeof value !== 'object') return false;

	const data = value as Partial<UpstreamContributionData>;
	return (
		Number.isInteger(data.total_contributions) &&
		(data.total_contributions ?? -1) >= 0 &&
		Array.isArray(data.weeks) &&
		data.weeks.length >= CONTRIBUTION_WEEKS
	);
};

const parseContributions = (data: UpstreamContributionData, username: string): ContributionResponse | null => {
	const weeks = data.weeks.slice(-CONTRIBUTION_WEEKS);
	const parsedWeeks: ContributionWeek[] = [];

	for (const week of weeks) {
		if (!isValidDate(week.first_day) || !Array.isArray(week.contribution_days) || week.contribution_days.length !== 7) {
			return null;
		}

		const firstDay = new Date(`${week.first_day}T00:00:00Z`);
		const days: ContributionDay[] = [];

		for (const day of week.contribution_days) {
			if (
				!Number.isInteger(day.weekday) ||
				day.weekday < 0 ||
				day.weekday > 6 ||
				!Number.isInteger(day.count) ||
				day.count < 0 ||
				!Number.isInteger(day.level) ||
				day.level < 0 ||
				day.level > 4
			) {
				return null;
			}

			const date = new Date(firstDay);
			date.setUTCDate(firstDay.getUTCDate() + day.weekday);
			days.push({
				date: date.toISOString().slice(0, 10),
				count: day.count,
				level: day.level,
			});
		}

		parsedWeeks.push({ days });
	}

	return {
		username,
		total: data.total_contributions,
		weeks: parsedWeeks,
	};
};

export const GET: APIRoute = async ({ params }) => {
	const username = params.username;

	if (!username || !GITHUB_USERNAME_PATTERN.test(username)) {
		return jsonResponse({ error: 'Invalid GitHub username' }, 400);
	}

	try {
		const upstreamResponse = await fetch(`https://github.com/${encodeURIComponent(username)}.contribs`, {
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Mona-Mayhem',
			},
		});

		if (upstreamResponse.status === 404) {
			return jsonResponse({ error: 'GitHub user not found' }, 404);
		}

		if (!upstreamResponse.ok) {
			return jsonResponse({ error: 'GitHub contribution service unavailable' }, 502);
		}

		const upstreamData: unknown = await upstreamResponse.json();
		if (!isUpstreamContributionData(upstreamData)) {
			return jsonResponse({ error: 'Invalid contribution data from GitHub' }, 502);
		}

		const contributions = parseContributions(upstreamData, username);
		if (!contributions) {
			return jsonResponse({ error: 'Invalid contribution data from GitHub' }, 502);
		}

		return jsonResponse(contributions);
	} catch {
		return jsonResponse({ error: 'GitHub contribution service unavailable' }, 502);
	}
};

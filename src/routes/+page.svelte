<script lang="ts">
	import { asset } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import profile from '../data/profile.json';

	function profileAsset(filename: string) {
		return asset(filename as Parameters<typeof asset>[0]);
	}

	const ink = profileAsset(profile.ink);
	const xPostUrl = /^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[a-z0-9_]+\/status\/\d+(?:[/?#]|$)/i;
	const socialLinkClass =
		'profile-link inline-grid justify-items-center gap-[clamp(0.5rem,1.5vw,1.375rem)] rounded-lg px-2 text-[clamp(1rem,1.4vw,1.25rem)] leading-tight tracking-[0.065em]';
	let discordTip = $state('');
	let discordTipTimeout: ReturnType<typeof setTimeout> | undefined;

	async function copyDiscordUsername(username: string) {
		try {
			await navigator.clipboard.writeText(username);
			discordTip = `Copied ${username}`;
		} catch {
			discordTip = `Couldn’t copy. Discord: ${username}`;
		}

		clearTimeout(discordTipTimeout);
		discordTipTimeout = setTimeout(() => (discordTip = ''), 3000);
	}

	onDestroy(() => clearTimeout(discordTipTimeout));

	onMount(() => {
		if (!profile.clips.entries.some(({ url }) => url && xPostUrl.test(url))) return;

		const { twttr } = window as Window & {
			twttr?: { widgets?: { load: (container?: HTMLElement) => void } };
		};

		if (twttr?.widgets) {
			twttr.widgets.load(document.getElementById('top-clips') ?? undefined);
		} else if (!document.getElementById('twitter-wjs')) {
			const script = document.createElement('script');
			script.id = 'twitter-wjs';
			script.src = 'https://platform.x.com/widgets.js';
			script.async = true;
			document.head.append(script);
		}
	});
</script>

<svelte:head>
	<title>{profile.name} | {profile.tagline}</title>
	<meta name="description" content={profile.bio.lines.join(' ')} />
	<meta name="theme-color" content="#fcfcfc" />
	<meta name="page-type" content="software" />
	<meta name="site-kind" content="gaming" />
	<link rel="icon" href={profileAsset(profile.favicon)} />
</svelte:head>

<div class="relative isolate overflow-hidden">
	<div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
		<img class="ink ink-left top-[3%] rotate-[-18deg]" src={ink} alt="" />
		<img class="ink ink-right top-[20%] rotate-[34deg]" src={ink} alt="" />
		<img class="ink ink-left top-[53%] rotate-[-56deg]" src={ink} alt="" />
		<img class="ink ink-right top-[73%] rotate-[143deg]" src={ink} alt="" />
		<img class="ink ink-left top-[95%] rotate-[76deg]" src={ink} alt="" />
	</div>

	<main class="wrap mx-auto w-full max-w-[63.125rem] px-6 pt-[clamp(1.75rem,4.7vw,4.5rem)] pb-[clamp(6rem,48vw,45rem)] sm:px-9">
		<section aria-labelledby="player-name">
			<div class="hero grid items-center justify-items-center gap-6 md:grid-cols-[2fr_2.6fr] md:justify-items-start md:gap-[clamp(2rem,5.3vw,5rem)]" data-enter>
				<img
					class="aspect-square w-full max-w-58 rounded-[27%] border border-ink object-cover md:max-w-none"
					src={profileAsset(profile.portrait.image)}
					alt={profile.portrait.alt}
					width="736"
					height="736"
					fetchpriority="high"
				/>
				<div class="text-center md:translate-y-3 md:text-left">
					<h1 id="player-name" class="text-[clamp(3.5rem,6vw,5.375rem)] leading-[1.05] font-bold tracking-tight">{profile.name}</h1>
					<p class="mt-3 text-[clamp(1.5rem,2.5vw,2.375rem)] leading-tight tracking-wide text-muted md:mt-5 md:tracking-[0.08em]">{profile.tagline}</p>
					<ul class="mt-5 flex justify-center gap-7 md:mt-7 md:justify-start md:gap-9" aria-label="Weapon X Power" role="list">
						{#each profile.weapons as weapon (weapon.name)}
							<li class="grid justify-items-center gap-2 whitespace-nowrap text-[clamp(1rem,1.4vw,1.25rem)] leading-tight">
								<img class="size-[clamp(3rem,5vw,4.5rem)] object-contain" src={profileAsset(weapon.image)} alt={weapon.name} />
								<span>XP {weapon.xp}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<ul class="mx-auto mt-[clamp(1.75rem,3vw,2.75rem)] grid max-w-[52.5rem] grid-cols-3 text-center" aria-label="Social profiles" role="list">
				{#each profile.socials as social (social.label)}
					{@const username = social.label === 'discord' ? social.username?.trim() : undefined}
					<li class:relative={!!username}>
						{#snippet socialIcon()}
							<span class="grid size-[clamp(3.25rem,6vw,5.625rem)] place-items-center">
								{#if social.image === 'twitter.png'}
									<span class="grid aspect-square w-[93%] place-items-center rounded-[24%] bg-[#1999e6]">
										<img class="w-2/3 brightness-0 invert" src={profileAsset(social.image)} alt="" />
									</span>
								{:else}
									<img class="max-h-full w-full object-contain" class:sendou={social.image === 'sendou.png'} src={profileAsset(social.image)} alt="" />
								{/if}
							</span>
							<span>{social.label}</span>
						{/snippet}
						{#if username}
							<button
								type="button"
								class={socialLinkClass}
								aria-label="Copy Discord username"
								onclick={() => copyDiscordUsername(username)}
							>
								{@render socialIcon()}
							</button>
							<span
								role="status"
								class={discordTip
									? 'absolute top-full left-1/2 z-10 mt-2 w-max max-w-64 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 font-sans text-sm text-paper wrap-anywhere'
									: 'sr-only'}
							>{discordTip}</span>
						{:else}
							<svelte:element
								this={social.url ? 'a' : 'span'}
								href={social.url ?? undefined}
								class={socialLinkClass}
							>
								{@render socialIcon()}
							</svelte:element>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		<section class="mt-[clamp(3rem,5.7vw,5.375rem)] text-center" aria-labelledby="bio-heading">
			<h2 id="bio-heading" class="section-heading">{profile.bio.heading}</h2>
			<div class="section-copy">
				{#each profile.bio.lines as line (line)}
					<p>{line}</p>
				{/each}
			</div>
		</section>

		<section class="follow-up text-center" aria-labelledby="results-heading">
			<h2 id="results-heading" class="section-heading">{profile.results.heading}</h2>
			<ul class="section-copy text-balance" role="list">
				{#each profile.results.entries as result (result)}
					<li>{result}</li>
				{/each}
			</ul>
		</section>

		<section id="top-clips" class="follow-up text-center" aria-labelledby="clips-heading">
			<h2 id="clips-heading" class="section-heading">{profile.clips.heading}</h2>
			<div class="mx-auto grid w-full max-w-119 gap-[clamp(1rem,3.2vw,3rem)]">
				{#each profile.clips.entries as clip (clip.title)}
					{#if clip.url && xPostUrl.test(clip.url)}
						<blockquote class="twitter-tweet" data-align="center" data-conversation="none" data-dnt="true">
							<a class="clip profile-link grid place-items-center p-4 text-2xl" href={clip.url}>
								Watch {clip.title} on X
							</a>
						</blockquote>
					{:else if clip.url}
						<a class="clip profile-link grid place-items-center p-4 text-2xl" href={clip.url}>{clip.title}</a>
					{:else}
						<div class="clip" aria-hidden="true"></div>
					{/if}
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	.ink {
		position: absolute;
		aspect-ratio: 1;
		width: clamp(10rem, 33vw, 23rem);
		max-width: none;
	}

	.ink-left {
		left: 0;
		translate: -59% -50%;
	}

	.ink-right {
		right: 0;
		translate: 59% -50%;
	}

	@media (min-width: 64rem) {
		.ink {
			width: min(49vw, 47rem);
		}

		.ink-left {
			translate: -52% -50%;
		}

		.ink-right {
			translate: 52% -50%;
		}
	}

	.sendou {
		width: 84%;
		border-radius: 26%;
	}

	.follow-up {
		margin-top: clamp(2.75rem, 4.9vw, 4.625rem);
	}

	.section-heading {
		margin-bottom: clamp(1.125rem, 2.1vw, 2rem);
		color: var(--color-splat-blue);
		font-size: clamp(2.5rem, 4vw, 3.75rem);
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.025em;
	}

	.section-copy {
		font-size: clamp(1.375rem, 2.55vw, 2.375rem);
		line-height: 1.4;
		letter-spacing: clamp(0.005em, calc(0.22vw - 0.8px), 0.07em);
	}

	.clip {
		aspect-ratio: 2 / 1;
		border-radius: clamp(0.875rem, 1.4vw, 1.375rem);
		background: var(--color-clip);
	}

	:is(a, button).profile-link:focus-visible {
		outline: 2px solid var(--color-splat-blue);
		outline-offset: 4px;
	}

	:is(a, button).profile-link:hover {
		text-decoration: underline;
	}

	button.profile-link {
		cursor: pointer;
	}

	@media (prefers-reduced-motion: no-preference) {
		.hero {
			animation: settle 450ms ease-out both;
		}

		@keyframes settle {
			from {
				transform: translateY(6px);
				opacity: 0.75;
			}
		}
	}

	@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		:is(a, button).profile-link {
			transition: transform 150ms ease-out;
		}

		:is(a, button).profile-link:hover {
			transform: translateY(-2px);
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import InstagramPanel from '$lib/components/InstagramPanel.svelte';
	import TikTokPanel from '$lib/components/TikTokPanel.svelte';
	import YouTubePanel from '$lib/components/YouTubePanel.svelte';

	let { data }: { data: PageData } = $props();

	// Route a connect failure to the panel that owns it; that panel shows the
	// banner and auto-opens its onboarding guide.
	const igError = $derived(data.errorPlatform === 'instagram' ? data.errorMessage : null);
	const ttError = $derived(data.errorPlatform === 'tiktok' ? data.errorMessage : null);
	const ytError = $derived(data.errorPlatform === 'youtube' ? data.errorMessage : null);

	onMount(() => {
		// Strip the error query string so a refresh doesn't keep showing it.
		if (data.connectError) history.replaceState(null, '', location.pathname);
	});
</script>

<svelte:head>
	<title>Vizzy × Social</title>
</svelte:head>

<main>
	<header class="app-header">
		<h1>Vizzy × Social</h1>
		<p class="sub">
			One link, three platforms. Connect Instagram, TikTok, and YouTube to pull each creator's
			profile, content, and analytics through the platform's official API. Tokens stay server-side
			in encrypted HttpOnly cookies.
		</p>
	</header>

	<InstagramPanel initialError={igError} />
	<TikTokPanel initialError={ttError} />
	<YouTubePanel initialError={ytError} />
</main>

<style>
	:global(body) {
		margin: 0;
		background: #f7f7f8;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #1a1a1a;
	}
	main {
		max-width: 920px;
		margin: 0 auto;
		padding: 32px 20px 80px;
	}
	.app-header {
		margin-bottom: 22px;
	}
	.app-header h1 {
		margin: 0 0 6px;
		font-size: 24px;
	}
	.sub {
		font-size: 13px;
		color: #666;
		margin: 0;
		max-width: 680px;
		line-height: 1.55;
	}

	/* ─── platform card ─────────────────────────────────────── */
	:global(.platform-card) {
		background: white;
		border: 1px solid #e2e2e6;
		border-radius: 12px;
		padding: 18px 20px;
		margin-bottom: 18px;
	}
	:global(.ph) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}
	:global(.ph h2) {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0;
		font-size: 17px;
	}
	:global(.logo) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 7px;
		color: white;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.5px;
	}
	:global(.logo svg) {
		width: 16px;
		height: 16px;
		display: block;
	}
	:global(.logo.ig) {
		background: linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888);
	}
	:global(.logo.tt) {
		background: #000;
	}
	:global(.logo.yt) {
		background: #ff0033;
	}
	:global(.status) {
		font-size: 12px;
		color: #999;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 50%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global(.status::before) {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #c9c9cf;
		flex: none;
	}
	:global(.status.on) {
		color: #1f9d55;
	}
	:global(.status.on::before) {
		background: #2ecc71;
	}

	/* ─── controls ──────────────────────────────────────────── */
	:global(.row) {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}
	:global(.connected-row) {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 13px;
		margin-bottom: 12px;
	}
	:global(.query-row) {
		margin-top: 12px;
	}
	:global(.btn) {
		font-size: 13px;
		padding: 6px 12px;
		border: 1px solid #d0d0d4;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		color: #1a1a1a;
	}
	:global(.btn:hover:not(:disabled)) {
		background: #f0f0f3;
	}
	:global(.btn:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}
	:global(.btn-primary) {
		color: white;
		border: none;
		padding: 10px 18px;
		font-weight: 500;
		font-size: 14px;
		border-radius: 6px;
		cursor: pointer;
	}
	:global(.btn-primary.ig) {
		background: linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888);
	}
	:global(.btn-primary.tt) {
		background: #000;
	}
	:global(.btn-primary.yt) {
		background: #ff0033;
	}
	:global(.btn-primary:hover) {
		filter: brightness(1.05);
	}
	:global(.btn-link) {
		background: transparent;
		border: none;
		color: #0b6fcc;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
		font-size: 13px;
	}
	:global(.platform-card input) {
		flex: 1;
		min-width: 240px;
		padding: 8px 12px;
		border: 1px solid #d0d0d4;
		border-radius: 6px;
		font-size: 13px;
	}

	/* ─── text bits ─────────────────────────────────────────── */
	:global(code) {
		background: #ececef;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 11px;
		word-break: break-all;
	}
	:global(.muted) {
		color: #888;
		font-size: 13px;
	}
	:global(.section-label) {
		font-size: 12px;
		font-weight: 600;
		color: #555;
		margin: 16px 0 8px;
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}
	:global(.error-banner) {
		background: #fdeced;
		border: 1px solid #f0b6ba;
		color: #b3261e;
		font-size: 13px;
		padding: 8px 12px;
		border-radius: 6px;
		margin-bottom: 12px;
	}
	:global(.badge) {
		background: #444;
		color: white;
		font-size: 10px;
		padding: 1px 6px;
		border-radius: 10px;
		text-transform: lowercase;
	}

	/* ─── user card ─────────────────────────────────────────── */
	:global(.user-card) {
		display: flex;
		gap: 16px;
		background: #fafafb;
		border: 1px solid #e6e6ea;
		border-radius: 8px;
		padding: 14px;
		margin-top: 12px;
	}
	:global(.avatar) {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		object-fit: cover;
		flex: none;
	}
	:global(.user-meta) {
		flex: 1;
	}
	:global(.user-name) {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	:global(.bio) {
		font-size: 13px;
		color: #444;
		margin: 4px 0;
		white-space: pre-wrap;
	}
	:global(.stats) {
		display: flex;
		gap: 16px;
		margin-top: 8px;
		font-size: 13px;
		flex-wrap: wrap;
	}

	/* ─── media grid (IG, 1:1) + videos (TikTok, 9:16) ──────── */
	:global(.media-grid),
	:global(.videos) {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 12px;
		margin-top: 12px;
	}
	:global(.media-grid) {
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	}
	:global(.videos) {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}
	:global(.media-card),
	:global(.video-card) {
		width: 100%;
		background: white;
		border: 1px solid #e0e0e2;
		border-radius: 8px;
		padding: 0;
		overflow: hidden;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
	}
	:global(.media-card:hover),
	:global(.video-card:hover) {
		border-color: #b0b0b6;
	}
	:global(.media-card.selected) {
		border-color: #dc2743;
		box-shadow: 0 0 0 2px rgba(220, 39, 67, 0.15);
	}
	:global(.thumb) {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		background: #ccc;
	}
	:global(.cover) {
		width: 100%;
		aspect-ratio: 9 / 16;
		object-fit: cover;
		background: #ccc;
	}
	:global(.thumb.placeholder) {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		font-size: 12px;
	}
	:global(.media-meta),
	:global(.video-meta) {
		padding: 8px 10px 10px;
	}
	:global(.media-caption),
	:global(.video-title) {
		font-size: 12px;
		font-weight: 500;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	:global(.media-stats),
	:global(.video-stats) {
		display: flex;
		gap: 8px;
		margin-top: 6px;
		font-size: 11px;
		color: #666;
		flex-wrap: wrap;
	}
	:global(.media-date),
	:global(.video-date) {
		font-size: 10px;
		color: #999;
		margin-top: 4px;
	}

	/* ─── insights table ────────────────────────────────────── */
	:global(table.insights) {
		margin-top: 12px;
		border-collapse: collapse;
		width: 100%;
		max-width: 480px;
		font-size: 13px;
		background: white;
		border: 1px solid #e0e0e2;
		border-radius: 6px;
		overflow: hidden;
	}
	:global(table.insights th),
	:global(table.insights td) {
		padding: 6px 12px;
		text-align: left;
		border-bottom: 1px solid #ececef;
	}
	:global(table.insights th) {
		background: #f4f4f6;
		font-weight: 500;
		color: #555;
	}
	:global(table.insights tr:last-child td) {
		border-bottom: none;
	}

	/* ─── embeds ────────────────────────────────────────────── */
	:global(.embed-wrap) {
		width: 100%;
		max-width: 340px;
		aspect-ratio: 9 / 16;
		margin-top: 12px;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
	}
	:global(.embed-wrap iframe) {
		width: 100%;
		height: 100%;
		border: 0;
	}
	:global(.embed-16x9) {
		position: relative;
		padding-top: 56.25%;
		margin: 12px 0;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
	}
	:global(.embed-16x9 iframe) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	/* ─── JSON result ───────────────────────────────────────── */
	:global(.json) {
		background: #1f1f24;
		color: #e6e6e9;
		padding: 14px;
		border-radius: 8px;
		overflow: auto;
		font-size: 12px;
		line-height: 1.45;
		max-height: 460px;
		white-space: pre-wrap;
		word-break: break-word;
	}
	:global(.result) {
		margin-top: 8px;
	}
</style>

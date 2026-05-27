<script lang="ts">
	import { onMount } from 'svelte';

	type Me =
		| { connected: false }
		| {
				connected: true;
				email: string;
				expires_at: number;
				has_refresh_token: boolean;
				scope: string;
		  };

	let { initialError = null }: { initialError?: string | null } = $props();

	let me = $state<Me>({ connected: false });
	const connectError = $derived(initialError);

	let publicVideoInput = $state('');
	let publicChannelInput = $state('');
	let analyticsVideoId = $state('');

	let resultLabel = $state<string>('');
	let resultJson = $state<unknown>(null);
	let resultStatus = $state<number | null>(null);
	let busy = $state(false);
	let embedVideoId = $state<string | null>(null);

	const connected = $derived(me.connected);

	onMount(refreshMe);

	async function refreshMe() {
		const res = await fetch('/api/youtube/auth/me');
		me = await res.json();
	}

	async function connect() {
		const res = await fetch('/api/youtube/auth/url');
		const { authorize_url } = (await res.json()) as { authorize_url: string };
		window.location.href = authorize_url;
	}

	async function logout() {
		await fetch('/api/youtube/auth/logout', { method: 'POST' });
		await refreshMe();
		resultLabel = '';
		resultJson = null;
		resultStatus = null;
		embedVideoId = null;
	}

	async function refreshToken() {
		await callEndpoint('refresh access_token', '/api/youtube/auth/refresh', { method: 'POST' });
		await refreshMe();
	}

	async function callEndpoint(label: string, path: string, init: RequestInit = {}) {
		busy = true;
		resultLabel = label;
		resultJson = null;
		resultStatus = null;
		try {
			const res = await fetch(path, init);
			resultStatus = res.status;
			const text = await res.text();
			try {
				resultJson = text ? JSON.parse(text) : null;
			} catch {
				resultJson = text;
			}
		} finally {
			busy = false;
		}
	}

	function playEmbedFromResult() {
		const data = resultJson as Record<string, unknown> | null;
		if (!data) return;
		if (typeof data.video_id === 'string') {
			embedVideoId = data.video_id;
			return;
		}
		const items = (data as { items?: Array<{ id?: string }> }).items;
		if (Array.isArray(items) && items[0]?.id) embedVideoId = items[0].id;
	}
</script>

<section class="platform-card">
	<header class="ph">
		<h2><span class="logo yt">YT</span> YouTube</h2>
		<span class="status" class:on={connected}>
			{me.connected ? me.email : 'Not connected'}
		</span>
	</header>

	{#if connectError}
		<div class="error-banner">⚠️ {connectError} — make sure your Google account is on the OAuth consent screen's Test users list.</div>
	{/if}

	<p class="section-label">Path A — public data (API key, any channel)</p>
	<div class="row">
		<input type="text" placeholder="YouTube video URL or 11-char id" bind:value={publicVideoInput} />
		<button
			class="btn"
			disabled={busy || !publicVideoInput.trim()}
			onclick={() =>
				callEndpoint(
					'GET /api/youtube/public/video',
					`/api/youtube/public/video?url=${encodeURIComponent(publicVideoInput.trim())}`
				)}
		>
			Look up video
		</button>
	</div>
	<div class="row">
		<input type="text" placeholder="Channel URL / @handle / UC… id" bind:value={publicChannelInput} />
		<button
			class="btn"
			disabled={busy || !publicChannelInput.trim()}
			onclick={() =>
				callEndpoint(
					'GET /api/youtube/public/channel',
					`/api/youtube/public/channel?url=${encodeURIComponent(publicChannelInput.trim())}`
				)}
		>
			Look up channel
		</button>
		<button
			class="btn"
			disabled={busy || !publicChannelInput.trim()}
			onclick={() =>
				callEndpoint(
					'GET /api/youtube/public/channel/videos',
					`/api/youtube/public/channel/videos?url=${encodeURIComponent(publicChannelInput.trim())}&max_results=20`
				)}
		>
			List uploads
		</button>
	</div>

	<p class="section-label">Path B — connected creator (OAuth + private Analytics)</p>
	{#if !connected}
		<div class="row">
			<button class="btn-primary yt" onclick={connect}>Connect YouTube</button>
		</div>
		<p class="muted">Your Google account must be on the OAuth consent screen's Test users list.</p>
	{:else}
		<div class="connected-row">
			<div class="muted">
				token expires {me.connected ? new Date(me.expires_at).toLocaleString() : ''} · refresh_token:
				{me.connected && me.has_refresh_token ? 'yes' : 'no'}
			</div>
			<div class="row">
				<button class="btn" disabled={busy} onclick={() => callEndpoint('GET /api/youtube/my/channel', '/api/youtube/my/channel')}>
					My channel
				</button>
				<button class="btn" disabled={busy} onclick={() => callEndpoint('GET /api/youtube/my/videos', '/api/youtube/my/videos?max_results=20')}>
					My videos
				</button>
				<button class="btn" disabled={busy} onclick={() => callEndpoint('Analytics — channel (28d)', '/api/youtube/analytics/report')}>
					Analytics (28d)
				</button>
				<button class="btn" disabled={busy} onclick={refreshToken}>Refresh token</button>
				<button class="btn-link" onclick={logout}>Disconnect</button>
			</div>
			<div class="row">
				<input type="text" placeholder="video_id (restrict Analytics to one video)" bind:value={analyticsVideoId} />
				<button
					class="btn"
					disabled={busy || !analyticsVideoId.trim()}
					onclick={() =>
						callEndpoint(
							'Analytics — single video',
							`/api/youtube/analytics/report?video_id=${encodeURIComponent(analyticsVideoId.trim())}`
						)}
				>
					Video analytics
				</button>
				<button
					class="btn"
					disabled={busy || !analyticsVideoId.trim()}
					onclick={() =>
						callEndpoint(
							'Analytics — retention curve',
							`/api/youtube/analytics/report?video_id=${encodeURIComponent(analyticsVideoId.trim())}&metrics=audienceWatchRatio,relativeRetentionPerformance&dimensions=elapsedVideoTimeRatio`
						)}
				>
					Retention curve
				</button>
			</div>
		</div>
	{/if}

	{#if resultLabel}
		<div class="result">
			<p class="section-label">
				Result — {resultLabel} {resultStatus ? `(${resultStatus})` : ''}
			</p>
			<div class="row">
				<button class="btn" disabled={!resultJson} onclick={playEmbedFromResult}>Embed video from result</button>
				{#if embedVideoId}
					<button class="btn" onclick={() => (embedVideoId = null)}>Clear embed</button>
				{/if}
			</div>
			{#if embedVideoId}
				<div class="embed-16x9">
					<iframe
						src={`https://www.youtube.com/embed/${embedVideoId}`}
						title="YouTube video"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{/if}
			<pre class="json">{JSON.stringify(resultJson, null, 2)}</pre>
		</div>
	{/if}
	</section>

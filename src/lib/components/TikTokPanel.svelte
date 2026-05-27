<script lang="ts">
	import { onMount } from 'svelte';
	import TikTokOnboarding from './TikTokOnboarding.svelte';

	let { initialError = null }: { initialError?: string | null } = $props();

	let connected = $state(false);
	let openId = $state<string | null>(null);
	let scope = $state<string | null>(null);
	let expiresAt = $state<string | null>(null);
	const connectError = $derived(initialError);

	let userInfo = $state<any>(null);
	let videos = $state<any[]>([]);
	let listCursor = $state(0);
	let listHasMore = $state(false);
	let queryUrl = $state('');
	let queryResult = $state<any>(null);
	let activePreview = $state<{ id: string; embed_link?: string } | null>(null);
	let loading = $state<string | null>(null);

	onMount(refreshAuthState);

	async function refreshAuthState() {
		const res = await fetch('/api/tiktok/auth/me');
		const data = await res.json();
		connected = data.connected;
		openId = data.open_id ?? null;
		scope = data.scope ?? null;
		expiresAt = data.expires_at ?? null;
	}

	async function connect() {
		const res = await fetch('/api/tiktok/auth/url');
		const data = await res.json();
		if (data.authorize_url) location.href = data.authorize_url;
	}

	async function disconnect() {
		await fetch('/api/tiktok/auth/logout', { method: 'POST' });
		connected = false;
		openId = null;
		userInfo = null;
		videos = [];
		listCursor = 0;
		queryResult = null;
		activePreview = null;
	}

	async function refreshToken() {
		loading = 'refresh';
		const res = await fetch('/api/tiktok/auth/refresh', { method: 'POST' });
		const data = await res.json();
		loading = null;
		if (data.refreshed) expiresAt = data.expires_at;
	}

	async function fetchUserInfo() {
		loading = 'user';
		const res = await fetch('/api/tiktok/user/info');
		userInfo = await res.json();
		loading = null;
	}

	async function fetchVideoList(cursor = 0) {
		loading = 'list';
		listCursor = cursor;
		const res = await fetch(`/api/tiktok/video/list?cursor=${cursor}&max_count=20`);
		const data = await res.json();
		if (data?.data?.videos) {
			videos = data.data.videos;
			listHasMore = !!data.data.has_more;
			listCursor = data.data.cursor ?? cursor;
		} else {
			videos = [];
			listHasMore = false;
		}
		loading = null;
	}

	async function queryByUrl() {
		if (!queryUrl.trim()) return;
		loading = 'query';
		const res = await fetch(`/api/tiktok/video/query?url=${encodeURIComponent(queryUrl.trim())}`);
		queryResult = await res.json();
		const v = queryResult?.data?.videos?.[0];
		if (v) activePreview = { id: v.id, embed_link: v.embed_link };
		loading = null;
	}

	function previewVideo(v: any) {
		activePreview = { id: v.id, embed_link: v.embed_link };
	}

	function fmtCount(n: number | undefined): string {
		if (n == null) return '—';
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}

	function fmtDate(epochSeconds: number | undefined): string {
		return epochSeconds ? new Date(epochSeconds * 1000).toLocaleDateString() : '';
	}
</script>

<section class="platform-card">
	<header class="ph">
		<h2><span class="logo tt">TT</span> TikTok</h2>
		<span class="status" class:on={connected}>{connected ? 'Connected' : 'Not connected'}</span>
	</header>

	{#if connectError}
		<div class="error-banner">⚠️ {connectError}</div>
	{/if}

	{#if !connected}
		<div class="row">
			<button class="btn-primary tt" onclick={connect}>Connect TikTok</button>
		</div>
		<p class="muted">Sandbox mode — only accounts on the Target users list can connect.</p>
		<TikTokOnboarding open={Boolean(initialError)} />
	{:else}
		<div class="connected-row">
			<div class="muted">open_id <code>{openId}</code> · token expires <code>{expiresAt}</code></div>
			<div class="row">
				<button class="btn" onclick={fetchUserInfo} disabled={loading === 'user'}>
					{loading === 'user' ? '…' : 'User info'}
				</button>
				<button class="btn" onclick={() => fetchVideoList(0)} disabled={loading === 'list'}>
					{loading === 'list' ? '…' : 'Videos'}
				</button>
				<button class="btn" onclick={refreshToken} disabled={loading === 'refresh'}>
					{loading === 'refresh' ? '…' : 'Refresh token'}
				</button>
				<button class="btn-link" onclick={disconnect}>Disconnect</button>
			</div>
		</div>

		{#if userInfo?.data?.user}
			{@const u = userInfo.data.user}
			<div class="user-card">
				{#if u.avatar_url}<img src={u.avatar_url} alt="avatar" class="avatar" />{/if}
				<div class="user-meta">
					<div class="user-name">
						<strong>{u.display_name ?? u.username}</strong>
						{#if u.username}<span class="muted">@{u.username}</span>{/if}
						{#if u.is_verified}<span class="badge">verified</span>{/if}
					</div>
					{#if u.bio_description}<p class="bio">{u.bio_description}</p>{/if}
					<div class="stats">
						<span><strong>{fmtCount(u.follower_count)}</strong> followers</span>
						<span><strong>{fmtCount(u.following_count)}</strong> following</span>
						<span><strong>{fmtCount(u.likes_count)}</strong> likes</span>
						<span><strong>{fmtCount(u.video_count)}</strong> videos</span>
					</div>
				</div>
			</div>
		{/if}

		{#if videos.length > 0}
			<ul class="videos">
				{#each videos as v}
					<li>
						<button class="video-card" onclick={() => previewVideo(v)}>
							{#if v.cover_image_url}<img src={v.cover_image_url} alt="cover" class="cover" />{/if}
							<div class="video-meta">
								<div class="video-title">{v.title || v.video_description || '(untitled)'}</div>
								<div class="video-stats">
									<span>👁 {fmtCount(v.view_count)}</span>
									<span>♥ {fmtCount(v.like_count)}</span>
									<span>💬 {fmtCount(v.comment_count)}</span>
									<span>↗ {fmtCount(v.share_count)}</span>
								</div>
								<div class="video-date">{fmtDate(v.create_time)}</div>
							</div>
						</button>
					</li>
				{/each}
			</ul>
			{#if listHasMore}
				<div class="row">
					<button class="btn" onclick={() => fetchVideoList(listCursor)} disabled={loading === 'list'}>Load more</button>
				</div>
			{/if}
		{/if}

		<div class="row query-row">
			<input
				type="url"
				placeholder="Paste a TikTok video URL (your own videos only)"
				bind:value={queryUrl}
				onkeydown={(e) => e.key === 'Enter' && queryByUrl()}
			/>
			<button class="btn" onclick={queryByUrl} disabled={loading === 'query' || !queryUrl.trim()}>
				{loading === 'query' ? '…' : 'Query'}
			</button>
		</div>

		{#if activePreview}
			<div class="embed-wrap">
				<iframe
					title="TikTok embed"
					src={activePreview.embed_link ?? `https://www.tiktok.com/embed/v2/${activePreview.id}`}
					allow="encrypted-media;"
					allowfullscreen
				></iframe>
			</div>
		{/if}
	{/if}
</section>

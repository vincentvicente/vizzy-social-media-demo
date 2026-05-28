<script lang="ts">
	import { onMount } from 'svelte';
	import InstagramOnboarding from './InstagramOnboarding.svelte';

	let { initialError = null }: { initialError?: string | null } = $props();

	let connected = $state(false);
	let userId = $state<string | null>(null);
	let scope = $state<string | null>(null);
	let expiresAt = $state<string | null>(null);
	const connectError = $derived(initialError);

	let profile = $state<any>(null);
	let media = $state<any[]>([]);
	let mediaPaging = $state<{ next?: string; previous?: string }>({});
	let mediaCursors = $state<{ after?: string; before?: string }>({});
	let selectedMedia = $state<any | null>(null);
	let mediaInsights = $state<any>(null);
	let accountInsights = $state<any>(null);
	let loading = $state<string | null>(null);

	onMount(refreshAuthState);

	async function refreshAuthState() {
		const res = await fetch('/api/instagram/auth/me');
		const data = await res.json();
		connected = data.connected;
		userId = data.user_id ?? null;
		scope = data.scope ?? null;
		expiresAt = data.expires_at ?? null;
	}

	async function connect() {
		const res = await fetch('/api/instagram/auth/url');
		const data = await res.json();
		if (data.authorize_url) location.href = data.authorize_url;
	}

	async function disconnect() {
		await fetch('/api/instagram/auth/logout', { method: 'POST' });
		connected = false;
		userId = null;
		profile = null;
		media = [];
		mediaPaging = {};
		mediaCursors = {};
		selectedMedia = null;
		mediaInsights = null;
		accountInsights = null;
	}

	async function refreshToken() {
		loading = 'refresh';
		const res = await fetch('/api/instagram/auth/refresh', { method: 'POST' });
		const data = await res.json();
		loading = null;
		if (data.refreshed) expiresAt = data.expires_at;
	}

	async function fetchProfile() {
		loading = 'profile';
		const res = await fetch('/api/instagram/my/profile');
		profile = await res.json();
		loading = null;
	}

	async function fetchMedia(direction: 'first' | 'next' | 'prev' = 'first') {
		loading = 'media';
		let url = '/api/instagram/my/media?limit=12';
		if (direction === 'next' && mediaCursors.after)
			url += `&after=${encodeURIComponent(mediaCursors.after)}`;
		if (direction === 'prev' && mediaCursors.before)
			url += `&before=${encodeURIComponent(mediaCursors.before)}`;
		const res = await fetch(url);
		const data = await res.json();
		if (Array.isArray(data?.data)) {
			media = data.data;
			mediaPaging = data.paging ?? {};
			mediaCursors = data.paging?.cursors ?? {};
		} else {
			media = [];
			mediaPaging = {};
			mediaCursors = {};
		}
		loading = null;
	}

	async function fetchMediaInsights(m: any) {
		selectedMedia = m;
		mediaInsights = null;
		loading = 'media-insights';
		const res = await fetch(
			`/api/instagram/my/media/${m.id}/insights?media_type=${encodeURIComponent(m.media_type ?? 'IMAGE')}`
		);
		mediaInsights = await res.json();
		loading = null;
	}

	async function fetchAccountInsights() {
		loading = 'account-insights';
		const res = await fetch('/api/instagram/my/insights?days=28');
		accountInsights = await res.json();
		loading = null;
	}

	function fmtCount(n: number | undefined): string {
		if (n == null) return '—';
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}

	function fmtDate(iso: string | undefined): string {
		return iso ? new Date(iso).toLocaleDateString() : '';
	}
</script>

<section class="platform-card">
	<header class="ph">
		<h2><span class="logo ig"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg></span> Instagram</h2>
		<span class="status" class:on={connected}>{connected ? `user ${userId ?? ''}` : 'Not connected'}</span>
	</header>

	{#if connectError}
		<div class="error-banner">⚠️ {connectError}</div>
	{/if}

	{#if !connected}
		<div class="row">
			<button class="btn-primary ig" onclick={connect}>Connect Instagram</button>
		</div>
		<p class="muted">Business / Creator accounts added as an Instagram Tester only.</p>
		<InstagramOnboarding open={Boolean(initialError)} />
	{:else}
		<div class="connected-row">
			<div class="muted">scope <code>{scope || '(empty)'}</code> · token expires <code>{expiresAt}</code></div>
			<div class="row">
				<button class="btn" onclick={fetchProfile} disabled={loading === 'profile'}>
					{loading === 'profile' ? '…' : 'Profile'}
				</button>
				<button class="btn" onclick={() => fetchMedia('first')} disabled={loading === 'media'}>
					{loading === 'media' ? '…' : 'Media'}
				</button>
				<button class="btn" onclick={fetchAccountInsights} disabled={loading === 'account-insights'}>
					{loading === 'account-insights' ? '…' : 'Insights (28d)'}
				</button>
				<button class="btn" onclick={refreshToken} disabled={loading === 'refresh'}>
					{loading === 'refresh' ? '…' : 'Refresh token'}
				</button>
				<button class="btn-link" onclick={disconnect}>Disconnect</button>
			</div>
		</div>

		{#if profile?.username}
			<div class="user-card">
				{#if profile.profile_picture_url}
					<img src={profile.profile_picture_url} alt="avatar" class="avatar" />
				{/if}
				<div class="user-meta">
					<div class="user-name">
						<strong>{profile.name ?? profile.username}</strong>
						<span class="muted">@{profile.username}</span>
						{#if profile.account_type}<span class="badge">{profile.account_type}</span>{/if}
					</div>
					{#if profile.biography}<p class="bio">{profile.biography}</p>{/if}
					<div class="stats">
						<span><strong>{fmtCount(profile.followers_count)}</strong> followers</span>
						<span><strong>{fmtCount(profile.follows_count)}</strong> following</span>
						<span><strong>{fmtCount(profile.media_count)}</strong> media</span>
					</div>
				</div>
			</div>
		{/if}

		{#if media.length > 0}
			<ul class="media-grid">
				{#each media as m}
					<li>
						<button
							class="media-card"
							class:selected={selectedMedia?.id === m.id}
							onclick={() => fetchMediaInsights(m)}
						>
							{#if m.thumbnail_url || m.media_url}
								<img src={m.thumbnail_url ?? m.media_url} alt="thumb" class="thumb" />
							{:else}
								<div class="thumb placeholder">{m.media_type}</div>
							{/if}
							<div class="media-meta">
								<div class="media-caption">{m.caption ?? '(no caption)'}</div>
								<div class="media-stats">
									<span>♥ {fmtCount(m.like_count)}</span>
									<span>💬 {fmtCount(m.comments_count)}</span>
								</div>
								<div class="media-date">{m.media_type} · {fmtDate(m.timestamp)}</div>
							</div>
						</button>
					</li>
				{/each}
			</ul>
			<div class="row">
				{#if mediaCursors.before}
					<button class="btn" onclick={() => fetchMedia('prev')} disabled={loading === 'media'}>← Prev</button>
				{/if}
				{#if mediaPaging.next}
					<button class="btn" onclick={() => fetchMedia('next')} disabled={loading === 'media'}>Next →</button>
				{/if}
			</div>
		{/if}

		{#if selectedMedia && mediaInsights?.data}
			<table class="insights">
				<thead><tr><th>metric ({selectedMedia.media_type})</th><th>value</th></tr></thead>
				<tbody>
					{#each mediaInsights.data as row}
						<tr><td><code>{row.name}</code></td><td>{row.values?.[0]?.value ?? '—'}</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if accountInsights?.data}
			<table class="insights">
				<thead><tr><th>account metric</th><th>total (28d)</th></tr></thead>
				<tbody>
					{#each accountInsights.data as row}
						<tr><td><code>{row.name}</code></td><td>{row.total_value?.value ?? row.values?.[0]?.value ?? '—'}</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{/if}
</section>

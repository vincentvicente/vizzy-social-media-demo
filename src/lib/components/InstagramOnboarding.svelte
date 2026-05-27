<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { open = false }: { open?: boolean } = $props();

	// Exact Meta app "Roles" console URL, configured per-deployment. Falls back to
	// the Meta developer home if not set (see PUBLIC_INSTAGRAM_TESTERS_URL in .env).
	const consoleUrl = env.PUBLIC_INSTAGRAM_TESTERS_URL || 'https://developers.facebook.com/apps/';

	let handle = $state('');
</script>

<details class="guide" {open}>
	<summary>Can't connect? Get your Instagram account approved</summary>
	<p class="muted">
		This app is in development. Until it passes app review, only <strong>Business</strong> or
		<strong>Creator</strong> accounts added as an <em>Instagram Tester</em> can connect. Two sides to
		set up — the console add, then an in-app accept:
	</p>
	<ol class="steps">
		<li>
			Make sure your account is <strong>Business</strong> or <strong>Creator</strong>: Instagram app
			→ Settings → <em>Account type and tools</em> → Switch to professional account.
		</li>
		<li>
			Add yourself as a tester in the Meta console:
			<a class="btn" href={consoleUrl} target="_blank" rel="noopener">Open Meta console ↗</a>
			<div class="handle-row">
				<input placeholder="your Instagram username" bind:value={handle} />
				{#if handle.trim()}
					<span class="muted">add: <code>{handle.trim().replace(/^@/, '')}</code></span>
				{/if}
			</div>
			<span class="muted">App roles → Roles → add Instagram testers → enter your username.</span>
		</li>
		<li>
			<strong>Accept the invite inside the Instagram app</strong>: Settings → Apps and websites →
			<em>Tester invites</em> → Accept. (Easy to miss — the connect fails without it.)
		</li>
		<li>Come back here and click <strong>Connect Instagram</strong> again.</li>
	</ol>
</details>

<style>
	.guide {
		border: 1px solid #d9b9d0;
		background: #fdf5fb;
		border-radius: 8px;
		padding: 12px 16px;
		margin-top: 12px;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 13px;
		color: #a3458f;
	}
	.steps {
		margin: 10px 0 0;
		padding-left: 20px;
		font-size: 13px;
		line-height: 1.7;
	}
	.steps li {
		margin-bottom: 8px;
	}
	.handle-row {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-top: 6px;
		flex-wrap: wrap;
	}
</style>

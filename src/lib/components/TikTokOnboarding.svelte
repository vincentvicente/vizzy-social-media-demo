<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { open = false }: { open?: boolean } = $props();

	// Exact "Target users" console URL, configured per-deployment. Falls back to
	// the TikTok developer home if not set (see PUBLIC_TIKTOK_SANDBOX_URL in .env).
	const consoleUrl = env.PUBLIC_TIKTOK_SANDBOX_URL || 'https://developers.tiktok.com/';

	let handle = $state('');
</script>

<details class="guide" {open}>
	<summary>Can't connect? Add your TikTok account to the sandbox</summary>
	<p class="muted">
		This app runs in TikTok's <strong>sandbox</strong>. Until it passes app review, only accounts
		on the sandbox <em>Target users</em> list (max 10) can connect. You have developer-console
		access, so you can add yourself in under a minute:
	</p>
	<ol class="steps">
		<li>
			Open the TikTok developer console:
			<a class="btn" href={consoleUrl} target="_blank" rel="noopener">Open console ↗</a>
		</li>
		<li>
			Go to your app → <strong>Sandbox</strong> → <strong>Target users</strong> →
			<strong>Add</strong>, then enter your TikTok username (without the “@”).
			<div class="handle-row">
				<input placeholder="your TikTok username" bind:value={handle} />
				{#if handle.trim()}
					<span class="muted">add: <code>{handle.trim().replace(/^@/, '')}</code></span>
				{/if}
			</div>
		</li>
		<li>
			Save — it takes effect immediately. Come back here and click <strong>Connect TikTok</strong>
			again.
		</li>
	</ol>
</details>

<style>
	.guide {
		border: 1px solid #d9c9a3;
		background: #fffaf0;
		border-radius: 8px;
		padding: 12px 16px;
		margin-top: 12px;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 13px;
		color: #8a6d3b;
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

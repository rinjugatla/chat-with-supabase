<script lang="ts">
	import { session, supabase } from '$lib/store';
	import { onMount } from 'svelte';
    import { Auth } from '@supabase/auth-ui-svelte';
	import { get } from 'svelte/store';
	import { ThemeSupa } from '@supabase/auth-ui-shared';

	onMount(async () => {
		const { data, error } = await get(supabase).auth.getSession();
		if (error) {
			console.log(error);
			return;
		}

		session.set(data.session);
	});
</script>

{#if get(session)}
	<div>Logged in!</div>
{:else}
	<Auth supabaseClient={get(supabase)} appearance={{ theme: ThemeSupa }}></Auth>
{/if}

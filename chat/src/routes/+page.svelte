<script lang="ts">
	import { goto } from '$app/navigation';
	import Auth from '$lib/components/supabase/Auth.svelte';
</script>

<Auth on:signin={() => {goto("/rooms")}}/>


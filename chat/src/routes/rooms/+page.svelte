<script lang="ts">
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
	import { Input, Label, Helper, Button } from 'flowbite-svelte';
	import { createClient } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import type { Database, Tables } from '$lib/types/supabase';
	import { sha256 } from '$lib';
	import { goto } from '$app/navigation';

	let rooms: Tables<'rooms'>[] | null = [];
	let roomName: string;
	let roomPassword: string;

	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	onMount(async () => {
		await fetch();
	});

	const insert = async () => {
		if (!roomName) {
			return;
		}
		const passwordHash = roomPassword ? await sha256(roomPassword) : '';
		await supabase.from('rooms').insert({ name: roomName, password: passwordHash });
		await fetch();
	};

	const fetch = async () => {
		const { data, error } = await supabase.from('rooms').select();
		rooms = data;
	};
</script>

<div>
	<div class="mb-6 grid gap-6">
		<h3>Create New Room</h3>
		<div class="flex">
			<div class="flex">
				<Label for="name" class="mx-2 content-center">Name</Label>
				<Input type="text" id="name" placeholder="text" bind:value={roomName} required />
			</div>
			<div class="flex">
				<Label for="password" class="mx-2 content-center">Password</Label>
				<Input
					type="password"
					id="password"
					placeholder="text"
					bind:value={roomPassword}
					required
				/>
			</div>
			<Button
				type="submit"
                class="mx-2"
				on:click={async () => {
					await insert();
				}}>Submit</Button
			>
		</div>
	</div>
</div>

<div class="m-5">
	<table class="border-collapse border-spacing-6 border border-slate-500">
		<thead>
			<th class="px-4">id</th>
			<th class="px-10">name</th>
			<th>created_at</th>
			<th class="px-6">enter</th>
		</thead>
		<tbody>
			{#if rooms}
				{#each rooms as room}
					<tr>
						<td>{room.id}</td>
						<td>{room.name}</td>
						<td>{room.created_at}</td>
						<th><Button on:click={() => goto(`rooms/${room.id}`)}>Enter</Button></th>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

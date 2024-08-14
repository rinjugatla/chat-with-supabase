<script lang="ts">
	import { Input, Label, Helper, Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { Tables } from '$lib/types/supabase';
	import { sha256 } from '$lib';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/store';

	let rooms: Tables<'rooms'>[] | null = [];
	let roomName: string;
	let roomPassword: string;

	onMount(async () => {
		await fetch();
		listen();
	});

	const listen = () => {
		get(supabase).channel("rooms").on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "rooms"
		}, (payload) => {
			const newRoom = payload.new as Tables<"rooms">;
			const newRooms = rooms ? [...rooms, newRoom] : [newRoom]
			rooms = newRooms.sort((a, b) => a.id - b.id);
		}).subscribe();
	}

	const insert = async () => {
		if (!roomName) {
			return;
		}
		const passwordHash = roomPassword ? await sha256(roomPassword) : '';
		await get(supabase).from('rooms').insert({ name: roomName, password: passwordHash });
	};

	const fetch = async () => {
		const { data, error } = await get(supabase).from('rooms').select();
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
			<th class="px-6">db</th>
			<th class="px-6">presence</th>
		</thead>
		<tbody>
			{#if rooms}
				{#each rooms as room}
					<tr>
						<td>{room.id}</td>
						<td>{room.name}</td>
						<td>{room.created_at}</td>
						<th><Button on:click={async () => await goto(`rooms/db/${room.id}`)}>Enter</Button></th>
						<th><Button on:click={async () => await goto(`rooms/presence/${room.id}`)}>Enter</Button></th>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

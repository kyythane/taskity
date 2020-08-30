<script lang="ts">
    import TaskColumn from './TaskColumn.svelte';
    import { selectedTasks } from './stores';
    let todo = [];
    let inProgress = [];
    let done = [...Array(500).keys()].map((i) => {
        return {
            id: `${i}`,
            title: `Done ${i}`,
            labels: [],
        };
    });
</script>

<section class="flex h-full w-full p-12">
    <TaskColumn
        columnTitle="Todo"
        columnData="{todo}"
        on:itemdroppedin="{({ detail }) => (todo = detail.listSnapshot)}"
        on:itemdraggedout="{({ detail }) => (todo = detail.listSnapshot)}"
    />
    <TaskColumn
        columnTitle="In Progress"
        columnData="{inProgress}"
        on:itemdroppedin="{({ detail }) => (inProgress = detail.listSnapshot)}"
        on:itemdraggedout="{({ detail }) => (inProgress = detail.listSnapshot)}"
    />
    <TaskColumn
        columnTitle="Done"
        columnData="{done}"
        on:itemdroppedin="{({ detail }) => (done = detail.listSnapshot)}"
        on:itemdraggedout="{({ detail }) => (done = detail.listSnapshot)}"
    />
</section>

<script lang="ts">
    import TaskColumn from './TaskColumn.svelte';
    import type { ColorName } from '../utility/Colors';
    import { selectedTasks } from './stores';
    const todo = [...Array(75).keys()].map((i) => {
        return {
            id: `${i}`,
            title: `Todo ${i}`,
            labels: [],
        };
    });
    const inProgress = [...Array(75).keys()].map((i) => {
        return {
            id: `${i + 75}`,
            title: `In Prog ${i}`,
            labels: [
                {
                    id: '1',
                    text: 'High Priority',
                    color: 'red' as ColorName,
                },
            ],
        };
    });
    const done = [...Array(75).keys()].map((i) => {
        return {
            id: `${i + 150}`,
            title: `Done ${i}`,
            labels: [],
        };
    });
</script>

<section class="flex h-full w-full p-12">
    {$selectedTasks.join(', ')}
    <TaskColumn columnTitle="Todo" columnData="{todo}" />
    <TaskColumn columnTitle="In Progress" columnData="{inProgress}" />
    <TaskColumn columnTitle="Done" columnData="{done}" />
</section>

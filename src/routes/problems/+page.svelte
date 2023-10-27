<script lang="ts">
    import { Column, Row } from "carbon-components-svelte";
    import AddProblem from "../../components/problems/AddProblemModal.svelte";
  import ProblemContext from "../../components/problems/ProblemContext.svelte";
  import ProblemFilter from "../../components/problems/ProblemFilter.svelte";
  import ProblemList from "../../components/problems/ProblemList.svelte";
</script>
<ProblemContext>
    <Row>
        <Column md={4} lg={14}>
            <h2>Problem Tracker</h2>
        </Column>
        <Column>
            <AddProblem/>
        </Column>
    </Row>

    <Row padding>
        <Column>
            <ProblemFilter />
        </Column>
    </Row>
    <ProblemList />
</ProblemContext>

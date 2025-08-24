export async function runWorkflow(workflowId) {
  const res = await fetch(`/api/workflows/run/${workflowId}`);
  const data = await res.json();

  const container = document.getElementById('workflow-runner');
  container.innerHTML = `
    <h3>Workflow Execution</h3>
    <ul>
      ${data.steps.map(step => `
        <li>
          <strong>${step.name}</strong>: ${step.status}
        </li>
      `).join('')}
    </ul>
  `;
}
export async function fetchWorkflowStatus(workflowId) {
    const res = await fetch(`/api/workflows/status/${workflowId}`);
    const status = await res.json();
    return status;
    }
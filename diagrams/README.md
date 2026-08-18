# Global Wealth University — SmartBio Mermaid Diagrams

This directory contains all system flowcharts, architecture diagrams, Entity-Relationship Diagrams (ERD), and sequence diagrams formatted in standard **Mermaid syntax** for direct visualization and export via **[Mermaid Live Editor](https://mermaid.live)**.

---

## 📋 Diagram Catalog

| File | Diagram Type | Purpose & Thesis Chapter Mapping |
| :--- | :--- | :--- |
| [`01_system_architecture.mmd`](01_system_architecture.mmd) | Architecture Diagram | Multi-tier client-cloud, WebAuthn, and storage architecture (**Chapter 3**). |
| [`02_biometric_and_flagging_workflow.mmd`](02_biometric_and_flagging_workflow.mmd) | Flowchart | Biometric scan, sweaty ridge detection, exception flagging & lecturer override (**Chapter 3 & 4**). |
| [`03_nuc_75_compliance_flow.mmd`](03_nuc_75_compliance_flow.mmd) | Flowchart | NUC 75% formula, threshold classifier, deficit forecast, and exam docket pipeline (**Chapter 3 & 4**). |
| [`04_rbac_and_class_rep_flow.mmd`](04_rbac_and_class_rep_flow.mmd) | RBAC Boundary Diagram | Role-based access control matrix and Class Representative proctor boundary (**Chapter 3**). |
| [`05_entity_relationship_diagram.mmd`](05_entity_relationship_diagram.mmd) | Entity-Relationship (ERD) | 3NF Normalized Relational Database Schema & Foreign Keys (**Chapter 4**). |
| [`06_multi_device_sync_sequence.mmd`](06_multi_device_sync_sequence.mmd) | Sequence Diagram | Real-time multi-device sync (Kiosk &rarr; Cloud &rarr; Lecturer &rarr; Student) (**Chapter 4**). |

---

## 🎨 How to View and Export in Mermaid Live:

1. Open your browser and navigate to **[https://mermaid.live](https://mermaid.live)**.
2. Open any `.mmd` file in this directory with a text editor (e.g. Notepad, VS Code).
3. **Copy the entire code** from the file and **paste it into the left editor pane** on `mermaid.live`.
4. The high-resolution diagram will instantly render in the right preview pane.
5. Click **Actions** &rarr; **Download PNG** or **Download SVG** to save crisp, high-resolution graphics for insertion into your Microsoft Word or LaTeX project report!

A utility company has **6,000 field technicians** who inspect equipment in basements, rural sites and tunnels where
connectivity is absent or unreliable for hours. Today they use paper forms that are typed in later. You are asked to
design an **offline-first progressive web app** that runs on company-managed Android tablets and some iPads.

Technicians must be able to:

- Download their assigned work orders (with site history, diagrams and photos) at the start of a shift.
- Complete inspection forms, take photos, capture signatures and create new defect reports while offline.
- Have everything sync automatically when connectivity returns, including on flaky connections.

Dispatchers in the office edit the same work orders (reassigning, adding notes, changing priority) while technicians
are offline. Some forms are edited by two technicians on the same site.

Design the client architecture, storage, sync protocol and conflict-resolution strategy, the service-worker and update
strategy, and how you would roll this out and support it as a platform used by several teams that build different
form types.

import { useMemo, useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Position,
  Handle,
  type Edge,
  type Node,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Archive,
  Briefcase,
  FileText,
  History,
  Link as LinkIcon,
  Mail,
  Phone,
  Plus,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Star,
  UserPen,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useFamilyStore } from '../store/useFamilyStore';
import { PERSON_POSITIONS } from '../lib/constants';
import { Badge, Button, Card, GhostButton, cn } from './ui';
import { ContactDialog, EventDialog, PersonDialog } from './Dialogs';
import type { Person, RelationshipStatus } from '../types/models';

const statusTint: Record<RelationshipStatus, string> = {
  close: 'border-emerald-500/70 bg-emerald-50',
  issues: 'border-orange-400/80 bg-orange-50',
  cut: 'border-blue-400/80 bg-blue-50',
  lost: 'border-rose-400/80 bg-rose-50',
  none: 'border-taupe bg-white',
};

function PersonNode({ data, selected }: { data: { person: Person; onSelect: (id: string) => void }; selected: boolean }) {
  const person = data.person;
  return (
    <div
      data-testid={`node-person-${person.id}`}
      onClick={() => data.onSelect(person.id)}
      className={cn(
        'min-w-[180px] rounded-xl border-2 px-3 py-2 shadow-sm transition',
        statusTint[person.relationshipStatus],
        person.lineageType === 'distant' && 'opacity-75',
        selected && 'ring-2 ring-ink/30',
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-ink/40" />
      <div className="mb-1 flex items-center justify-center gap-1 text-ink/60">
        {person.isDeceased && <Skull size={12} />}
        {person.religion && <Star size={12} />}
        {person.disavowedFaith && <Sparkles size={12} />}
        {person.emotionalConnections.length > 0 && <LinkIcon size={12} />}
      </div>
      <p className="text-center font-serif text-[15px] text-ink" data-testid={`text-person-name-${person.id}`}>{person.name}</p>
      <p className="text-center text-[10px] uppercase tracking-[0.18em] text-ink/60">{person.title || 'Unspecified'}</p>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-none !bg-ink/40" />
    </div>
  );
}

function DashboardInner() {
  const { fitView } = useReactFlow();
  const { people, events, contacts, selectedPersonId, selectPerson, addPerson, updatePerson, addEvent, addContact } = useFamilyStore();
  const selectedPerson = people.find((person) => person.id === selectedPersonId);
  const [personOpen, setPersonOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    document.title = 'Family Intelligence System';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'An elegant family archive dashboard for visualizing lineage, relationship dynamics, timeline events, and trusted contacts.',
      );
    }
  }, []);

  const onSelect = useCallback((id: string) => selectPerson(id), [selectPerson]);

  const nodes: Node[] = useMemo(
    () =>
      people.map((person) => ({
        id: person.id,
        type: 'personNode',
        data: { person, onSelect },
        position: PERSON_POSITIONS[person.id] ?? { x: 600 + Number(person.id) * 30, y: 120 + Number(person.id) * 40 },
      })),
    [people, onSelect],
  );

  const edges: Edge[] = useMemo(() => {
    const partnerEdges: Edge[] = [];
    const parentChildEdges: Edge[] = [];
    const emotionalEdges: Edge[] = [];

    people.forEach((person) => {
      person.partnerIds.forEach((partnerId) => {
        if (person.id < partnerId) {
          partnerEdges.push({
            id: `partner-${person.id}-${partnerId}`,
            source: person.id,
            target: partnerId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#9b958b', strokeDasharray: '5 4' },
          });
        }
      });

      person.childrenIds.forEach((childId) => {
        parentChildEdges.push({
          id: `child-${person.id}-${childId}`,
          source: person.id,
          target: childId,
          type: 'smoothstep',
          style: { stroke: '#2f2b25', strokeWidth: 1.6 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2f2b25', width: 14, height: 14 },
        });
      });

      person.emotionalConnections.forEach((targetId) => {
        emotionalEdges.push({
          id: `emotion-${person.id}-${targetId}`,
          source: person.id,
          target: targetId,
          type: 'default',
          style: { stroke: '#3a73b8', strokeOpacity: 0.45, strokeWidth: 1.5 },
        });
      });
    });

    return [...partnerEdges, ...parentChildEdges, ...emotionalEdges];
  }, [people]);

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 80);
    return () => clearTimeout(t);
  }, [fitView, nodes.length]);

  return (
    <div className="flex h-screen flex-col bg-paper text-ink">
      <header className="flex h-16 items-center justify-between border-b border-taupe/70 bg-paper/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md border border-taupe bg-white"><Archive size={16} /></div>
          <h1 className="font-serif text-xl">Family Intelligence System</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button data-testid="button-add-person" onClick={() => setPersonOpen(true)}>Add Person</Button>
          <Button data-testid="button-add-event" onClick={() => setEventOpen(true)}>Add Event</Button>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[1fr_320px]">
        <Card className="grid min-h-0 grid-rows-[1fr_280px] gap-4 bg-transparent p-0 shadow-none border-none">
          <Card className="relative min-h-[420px] overflow-hidden p-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onPaneClick={() => selectPerson(null)}
              nodeTypes={{ personNode: PersonNode }}
              fitView
              className="bg-white"
            >
              <Background gap={20} color="#ebe5db" />
              <MiniMap pannable zoomable nodeColor={(n) => {
                const person = people.find((p) => p.id === n.id);
                if (!person) return '#c7bda9';
                return person.relationshipStatus === 'close' ? '#4f9a7a' : person.relationshipStatus === 'issues' ? '#cf7b3d' : person.relationshipStatus === 'cut' ? '#3e73b4' : person.relationshipStatus === 'lost' ? '#ba4f5b' : '#8f8474';
              }} maskColor="rgba(246,242,234,.7)" />
              <Controls className="!border !border-taupe !bg-white" />
            </ReactFlow>
          </Card>

          <Card className="flex min-h-0 flex-col p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><Shield size={16} /><h2 className="font-serif text-lg">Trusted Contacts</h2></div>
              <GhostButton data-testid="button-add-contact" onClick={() => setContactOpen(true)}><Plus size={14} /></GhostButton>
            </div>
            {contacts.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-ink/60">No trusted contacts added.</div>
            ) : (
              <div className="grid gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {contacts.map((contact) => (
                  <article key={contact.id} data-testid={`card-contact-${contact.id}`} className="rounded-xl border border-taupe bg-white p-3 transition hover:border-ink/30">
                    <h3 className="font-serif">{contact.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink/60">{contact.relation}</p>
                    <div className="my-2 h-px bg-taupe/80" />
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2"><Phone size={13} />{contact.phone}</p>
                      <p className="flex items-center gap-2"><Mail size={13} />{contact.email}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </Card>

        <Card className="flex min-h-0 flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><History size={16} /><h2 className="font-serif text-lg">Recent Archive Entries</h2></div>
            <GhostButton onClick={() => setEventOpen(true)}><Plus size={14} /></GhostButton>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1">
            {events.map((event) => (
              <div key={event.id} className="relative border-b border-taupe/70 pb-3 pl-5 last:border-none">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-ink/70" />
                <div className="absolute left-[4px] top-4 h-[calc(100%-8px)] w-px bg-taupe" />
                <p className="font-serif text-[15px]">{event.title}</p>
                <p className="font-mono text-xs text-ink/60">{event.date}</p>
                <p className="mt-1 text-sm text-ink/75">{event.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {event.personIds.map((id) => {
                    const person = people.find((p) => p.id === id);
                    return person ? <Badge key={id}>{person.name}</Badge> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <aside className={cn('fixed right-0 top-0 z-30 h-full w-full max-w-[360px] border-l border-taupe bg-white shadow-card transition-transform duration-300', selectedPerson ? 'translate-x-0' : 'translate-x-full')}>
        {selectedPerson && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-taupe p-4">
              <h2 className="font-serif text-xl">Profile</h2>
              <div className="flex gap-2">
                <GhostButton data-testid="button-edit-person" onClick={() => setPersonOpen(true)}><UserPen size={15} /></GhostButton>
                <GhostButton data-testid="button-close-profile" onClick={() => selectPerson(null)}><X size={15} /></GhostButton>
              </div>
            </div>
            <div className="space-y-5 overflow-y-auto p-4">
              <div>
                <h3 className="font-serif text-2xl">{selectedPerson.name}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink/70">{selectedPerson.isDeceased && <Skull size={14} />}<Briefcase size={14} />{selectedPerson.title || 'No title'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedPerson.lineageType === 'direct' ? 'Direct Lineage' : 'Distant Lineage'}</Badge>
                {selectedPerson.relationshipStatus !== 'none' && <Badge className="capitalize">{selectedPerson.relationshipStatus}</Badge>}
                {selectedPerson.religion && <Badge>Religious</Badge>}
                {selectedPerson.disavowedFaith && <Badge>Disavowed Faith</Badge>}
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/65"><FileText size={12} />Archival Notes</p>
                <p className="text-sm leading-6 text-ink/80">{selectedPerson.notes}</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/65"><LinkIcon size={12} />Emotional Ties</p>
                <div className="space-y-1 text-sm">
                  {selectedPerson.emotionalConnections.length === 0 ? 'None listed.' : selectedPerson.emotionalConnections.map((id) => {
                    const person = people.find((p) => p.id === id);
                    return person ? <div key={id} className="flex items-center gap-2"><LinkIcon size={12} />{person.name}</div> : null;
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/65"><ScrollText size={12} />Event Timeline</p>
                <div className="space-y-3 border-l border-taupe pl-4">
                  {events.filter((e) => e.personIds.includes(selectedPerson.id)).length === 0 ? (
                    <p className="text-sm text-ink/60">No recorded events.</p>
                  ) : (
                    events
                      .filter((e) => e.personIds.includes(selectedPerson.id))
                      .map((e) => (
                        <div key={e.id} className="relative rounded-lg border border-taupe/80 bg-mist/40 p-2">
                          <span className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-ink/70" />
                          <p className="font-medium">{e.title}</p>
                          <p className="text-xs text-ink/60">{format(new Date(e.date), 'MMM yyyy')}</p>
                          <p className="text-sm text-ink/75">{e.description}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <PersonDialog
        open={personOpen}
        onClose={() => setPersonOpen(false)}
        initial={selectedPerson || undefined}
        onSave={(person) => {
          if (selectedPerson) {
            updatePerson(selectedPerson.id, person);
            return;
          }
          addPerson(person);
        }}
      />
      <EventDialog open={eventOpen} onClose={() => setEventOpen(false)} onSave={(event) => addEvent(event)} />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} onSave={(contact) => addContact(contact)} />
    </div>
  );
}

export function Dashboard() {
  return (
    <ReactFlowProvider>
      <DashboardInner />
    </ReactFlowProvider>
  );
}

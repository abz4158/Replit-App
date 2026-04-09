import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Label, Select, Textarea } from './ui';
import type { Person } from '../types/models';

type ModalProps = { open: boolean; title: string; onClose: () => void; children: React.ReactNode };

function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-taupe bg-paper p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

const personSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  title: z.string().default(''),
  lineageType: z.enum(['direct', 'distant']),
  relationshipStatus: z.enum(['none', 'close', 'issues', 'cut', 'lost']),
  isDeceased: z.boolean(),
  religion: z.boolean(),
  disavowedFaith: z.boolean(),
  notes: z.string().default(''),
});

type PersonValues = z.infer<typeof personSchema>;

export function PersonDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (values: Omit<Person, 'id'>) => void; initial?: Person; }) {
  const form = useForm<PersonValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: initial?.name ?? '',
      title: initial?.title ?? '',
      lineageType: initial?.lineageType ?? 'direct',
      relationshipStatus: initial?.relationshipStatus ?? 'none',
      isDeceased: initial?.isDeceased ?? false,
      religion: initial?.religion ?? false,
      disavowedFaith: initial?.disavowedFaith ?? false,
      notes: initial?.notes ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      name: initial?.name ?? '',
      title: initial?.title ?? '',
      lineageType: initial?.lineageType ?? 'direct',
      relationshipStatus: initial?.relationshipStatus ?? 'none',
      isDeceased: initial?.isDeceased ?? false,
      religion: initial?.religion ?? false,
      disavowedFaith: initial?.disavowedFaith ?? false,
      notes: initial?.notes ?? '',
    });
  }, [form, initial, open]);

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Person' : 'Add Person'}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSave({
            ...values,
            parentIds: initial?.parentIds ?? [],
            childrenIds: initial?.childrenIds ?? [],
            emotionalConnections: initial?.emotionalConnections ?? [],
            partnerIds: initial?.partnerIds ?? [],
          });
          onClose();
        })}
      >
        <div>
          <Label>Full Name</Label>
          <Input data-testid="input-person-name" {...form.register('name')} />
          {form.formState.errors.name && <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Label>Title / Role</Label>
          <Input {...form.register('title')} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Lineage</Label>
            <Select {...form.register('lineageType')}>
              <option value="direct">Direct</option>
              <option value="distant">Distant / Extended</option>
            </Select>
          </div>
          <div>
            <Label>Relationship Status</Label>
            <Select {...form.register('relationshipStatus')}>
              <option value="none">Neutral / None</option>
              <option value="close">Close (Green)</option>
              <option value="issues">Issues (Orange)</option>
              <option value="cut">Cut (Blue)</option>
              <option value="lost">Lost (Red)</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            ['isDeceased', 'Deceased'],
            ['religion', 'Religious'],
            ['disavowedFaith', 'Disavowed Faith'],
          ].map(([id, label]) => (
            <label key={id} className="flex items-center gap-2 rounded-lg border border-taupe bg-white p-2">
              <input type="checkbox" className="accent-ink" {...form.register(id as keyof PersonValues)} />
              {label}
            </label>
          ))}
        </div>
        <div>
          <Label>Archival Notes</Label>
          <Textarea rows={4} {...form.register('notes')} />
        </div>
        <Button type="submit">Save Person</Button>
      </form>
    </Modal>
  );
}

const eventSchema = z.object({
  title: z.string().min(1, 'Event Title is required'),
  date: z.string().min(1, 'Date is required'),
  personIds: z.string().default(''),
  description: z.string().default(''),
});

export function EventDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (values: { title: string; date: string; personIds: string[]; description: string }) => void; }) {
  const form = useForm<z.infer<typeof eventSchema>>({ resolver: zodResolver(eventSchema), defaultValues: { title: '', date: '', personIds: '', description: '' } });

  useEffect(() => {
    if (open) form.reset({ title: '', date: '', personIds: '', description: '' });
  }, [form, open]);

  return (
    <Modal open={open} onClose={onClose} title="Add Event">
      <form className="space-y-4" onSubmit={form.handleSubmit((v) => { onSave({ ...v, personIds: v.personIds.split(',').map((id) => id.trim()).filter(Boolean) }); onClose(); })}>
        <div><Label>Event Title</Label><Input data-testid="input-event-title" {...form.register('title')} /></div>
        <div><Label>Date</Label><Input type="date" {...form.register('date')} /></div>
        <div><Label>Involved Persons (comma-separated IDs)</Label><Input {...form.register('personIds')} /></div>
        <div><Label>Description</Label><Textarea rows={4} {...form.register('description')} /></div>
        <Button type="submit">Save Event</Button>
      </form>
    </Modal>
  );
}

export function ContactDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (values: { name: string; relation: string; phone: string; email: string; notes: string }) => void; }) {
  const schema = z.object({ name: z.string().min(1), relation: z.string(), phone: z.string(), email: z.string().email(), notes: z.string() });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', relation: '', phone: '', email: '', notes: '' } });

  useEffect(() => {
    if (open) form.reset({ name: '', relation: '', phone: '', email: '', notes: '' });
  }, [form, open]);

  return (
    <Modal open={open} onClose={onClose} title="Add Trusted Contact">
      <form className="space-y-4" onSubmit={form.handleSubmit((v) => { onSave(v); onClose(); })}>
        <div><Label>Name</Label><Input {...form.register('name')} /></div>
        <div><Label>Relation / Role</Label><Input {...form.register('relation')} /></div>
        <div><Label>Phone</Label><Input {...form.register('phone')} /></div>
        <div><Label>Email</Label><Input data-testid="input-contact-email" {...form.register('email')} /></div>
        <div><Label>Notes</Label><Textarea rows={3} {...form.register('notes')} /></div>
        <Button type="submit">Save Contact</Button>
      </form>
    </Modal>
  );
}

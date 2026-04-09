import { create } from 'zustand';
import { INITIAL_CONTACTS, INITIAL_EVENTS, INITIAL_PEOPLE } from '../lib/constants';
import type { ArchiveEvent, Person, TrustedContact } from '../types/models';

interface FamilyState {
  people: Person[];
  events: ArchiveEvent[];
  contacts: TrustedContact[];
  selectedPersonId: string | null;
  selectPerson: (id: string | null) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, updates: Omit<Person, 'id'>) => void;
  addEvent: (event: Omit<ArchiveEvent, 'id'>) => void;
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  people: INITIAL_PEOPLE,
  events: [...INITIAL_EVENTS].sort((a, b) => (a.date < b.date ? 1 : -1)),
  contacts: INITIAL_CONTACTS,
  selectedPersonId: null,
  selectPerson: (id) => set({ selectedPersonId: id }),
  addPerson: (person) =>
    set((state) => ({
      people: [...state.people, { ...person, id: crypto.randomUUID() }],
    })),
  updatePerson: (id, updates) =>
    set((state) => ({
      people: state.people.map((person) => (person.id === id ? { ...updates, id } : person)),
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: crypto.randomUUID() }].sort((a, b) => (a.date < b.date ? 1 : -1)),
    })),
  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts, { ...contact, id: crypto.randomUUID() }],
    })),
}));

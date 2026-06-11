import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ysnwuehcbvnevuuqcyyx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzbnd1ZWhjYnZuZXZ1dXFjeXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk2OTUsImV4cCI6MjA4OTIzNTY5NX0.Efi5SB_9NkqbiPK_k0gFB5SB3pze0uMv77UXPjZK4O4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

const realSupabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export function isSandboxActive(): boolean {
  return localStorage.getItem('supabase_fallback_sandbox') === 'true';
}

export function setSandboxActive(active: boolean) {
  localStorage.setItem('supabase_fallback_sandbox', active ? 'true' : 'false');
}

// ----------------- SANDBOX STORAGE HELPER -----------------
const listeners: Array<(event: string, session: any) => void> = [];

const mockAuth = {
  async getSession() {
    const currentSession = JSON.parse(localStorage.getItem('sandbox_session') || 'null');
    return { data: { session: currentSession }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    listeners.push(callback);
    const session = JSON.parse(localStorage.getItem('sandbox_session') || 'null');
    // fire initial event
    setTimeout(() => {
      callback('SIGNED_IN', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe() {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
          }
        }
      }
    };
  },

  async signInWithPassword({ email }: any) {
    const users = JSON.parse(localStorage.getItem('sandbox_users') || '[]');
    let user = users.find((u: any) => u.email === email);
    
    if (!user) {
      user = {
        id: 'sandbox-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
        email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      users.push(user);
      localStorage.setItem('sandbox_users', JSON.stringify(users));
    }

    const session = { user, access_token: 'sandbox-jwt' };
    localStorage.setItem('sandbox_session', JSON.stringify(session));
    
    listeners.forEach(cb => cb('SIGNED_IN', session));
    return { data: { user, session }, error: null };
  },

  async signUp({ email, options }: any) {
    const users = JSON.parse(localStorage.getItem('sandbox_users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      return { data: null, error: { message: "User already exists in Local Sandbox." } };
    }

    const user = {
      id: 'sandbox-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
      email,
      user_metadata: { full_name: options?.data?.full_name || email.split('@')[0] }
    };
    users.push(user);
    localStorage.setItem('sandbox_users', JSON.stringify(users));

    const session = { user, access_token: 'sandbox-jwt' };
    localStorage.setItem('sandbox_session', JSON.stringify(session));

    listeners.forEach(cb => cb('SIGNED_IN', session));
    return { data: { user, session }, error: null };
  },

  async signOut() {
    localStorage.removeItem('sandbox_session');
    listeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  }
};

class MockChain {
  tableName: string;
  filters: Array<{ column: string; value: any }> = [];
  orderCol: string | null = null;
  ascending: boolean = true;
  isSingle: boolean = false;
  insertValue: any = null;
  isDelete: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = '*') {
    // Simply return self for chain
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.ascending = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(value: any) {
    this.insertValue = value;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  // Awaitable interface
  async then(onfulfilled?: (value: any) => any, onrejected?: (err: any) => any) {
    try {
      const data = await this.execute();
      if (onfulfilled) return onfulfilled({ data, error: null });
      return { data, error: null };
    } catch (error: any) {
      if (onrejected) return onrejected(error);
      return { data: null, error };
    }
  }

  async execute() {
    let list = JSON.parse(localStorage.getItem('sandbox_journal_entries') || '[]');

    if (this.isDelete) {
      list = list.filter((item: any) => {
        return !this.filters.every(f => item[f.column] === f.value);
      });
      localStorage.setItem('sandbox_journal_entries', JSON.stringify(list));
      window.dispatchEvent(new Event('sandbox_journal_change'));
      return { status: 200 };
    }

    if (this.insertValue) {
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 11);

      const itemsToInsert = Array.isArray(this.insertValue) ? this.insertValue : [this.insertValue];
      const newItems = itemsToInsert.map(item => ({
        id: uuid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item
      }));
      list.push(...newItems);
      localStorage.setItem('sandbox_journal_entries', JSON.stringify(list));
      window.dispatchEvent(new Event('sandbox_journal_change'));
      return Array.isArray(this.insertValue) ? newItems : newItems[0];
    }

    let result = [...list];
    for (const filter of this.filters) {
      result = result.filter((item: any) => {
        const itemVal = item[filter.column];
        return String(itemVal) === String(filter.value);
      });
    }

    if (this.orderCol) {
      result.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.ascending ? -1 : 1;
        if (valA > valB) return this.ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.isSingle) {
      return result[0] || null;
    }

    return result;
  }
}

// ----------------- SUPABASE ROUTER/PROXY -----------------
class SupabaseProxy {
  get auth() {
    if (isSandboxActive()) {
      return mockAuth;
    }
    return realSupabase.auth;
  }

  from(table: string) {
    if (isSandboxActive()) {
      return new MockChain(table) as any;
    }
    return realSupabase.from(table);
  }

  channel(name: string) {
    if (isSandboxActive()) {
      return {
        on(event: string, config: any, callback: () => void) {
          return {
            subscribe() {
              window.addEventListener('sandbox_journal_change', callback);
              return {
                unsubscribe() {
                  window.removeEventListener('sandbox_journal_change', callback);
                }
              };
            }
          };
        }
      } as any;
    }
    return realSupabase.channel(name);
  }
}

export const supabase = new SupabaseProxy() as any;

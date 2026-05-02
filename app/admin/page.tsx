'use client';

import Link from 'next/link';
import { Settings, Zap, Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-foreground mb-2">Painel Admin</h1>
          <p className="text-muted-foreground">Gerencie os links beta e configurações do Finexa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Link para gerenciar beta */}
          <Link href="/admin/beta">
            <div className="nb-card bg-card p-6 hover:border-[#5330ff] cursor-pointer transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5330ff]/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-[#5330ff]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground mb-1">Links Beta</h2>
                  <p className="text-sm text-muted-foreground">Crie e gerencie links de acesso ao beta</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Placeholder para futuros módulos */}
          <div className="nb-card bg-card p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground mb-1">Usuários</h2>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </div>
            </div>
          </div>

          <div className="nb-card bg-card p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground mb-1">Configurações</h2>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

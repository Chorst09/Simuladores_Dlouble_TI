// src/app/app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, LogOut, User, Briefcase, BarChart, Search,
    Users, DollarSign, Archive, Calculator, PlusCircle,
    Trash2, Edit, Building, ShoppingCart, ExternalLink, FileDown, Paperclip,
    X, Server, Headset, Printer, ChevronDown, Tag, Info, Settings, FileText,
    BarChart2, TrendingUp, Percent, ShoppingBag, Repeat, Wrench, Zap,
    CheckCircle, Award, Gavel, Moon, Sun, Brain, Phone, Wifi, Radio, CheckSquare, BarChart3, ClipboardList
} from 'lucide-react';

// Importe seus componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Importe seus componentes de View
import DashboardView from '@/components/dashboard/DashboardView';
import PABXSIPCalculator from '@/components/calculators/PABXSIPCalculator';
import MaquinasVirtuaisCalculator from '@/components/calculators/MaquinasVirtuaisCalculator';
import FiberLinkCalculator from '@/components/calculators/FiberLinkCalculator';
import InternetMANCalculator from '@/components/calculators/InternetMANCalculator';
import RadioInternetCalculator from '@/components/calculators/RadioInternetCalculator';
import DoubleRadioFibraCalculator from '@/components/calculators/DoubleRadioFibraCalculator';
import ReportsView from '@/components/reports/ReportsView';

// Importe dados e tipos
import type { NavItem } from '@/lib/types';

// Importe o hook useTheme
import { useTheme } from 'next-themes';

export default function AppPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('calculator-pabx-sip');

    // Verificar autenticação
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData.user);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        setMounted(true);
    }, [router]);

    // Função de logout
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    };

    // Definição dos Itens de Navegação
    const navItems: NavItem[] = useMemo(() => {
        const baseItems: NavItem[] = [];
        
        // Apenas admin tem acesso ao dashboard
        if (user?.role === 'admin') {
            baseItems.push({ id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> });
        }
        
        // Todos os usuários têm acesso à precificação
        baseItems.push({
            id: 'pricing',
            label: 'Precificação',
            icon: <Calculator size={20} />,
            subItems: [
                { id: 'calculator-pabx-sip', label: 'PABX/SIP', icon: <Phone size={16} /> },
                { id: 'calculator-maquinas-virtuais', label: 'Máquinas Virtuais', icon: <Server size={16} /> },
                { id: 'calculator-fiber-link', label: 'Internet Fibra', icon: <Wifi size={16} /> },
                { id: 'calculator-internet-man', label: 'Internet MAN', icon: <Wifi size={16} /> },
                { id: 'calculator-radio-internet', label: 'Internet via Rádio', icon: <Radio size={16} /> },
                { id: 'calculator-double-radio-fibra', label: 'Double-Radio+Fibra', icon: <Radio size={16} /> },
            ]
        });

        // Adiciona menu Ferramentas para admin e diretor
        if (user?.role === 'admin' || user?.role === 'diretor') {
            baseItems.push({
                id: 'tools',
                label: 'Ferramentas',
                icon: <Wrench size={20} />,
                subItems: [
                    { id: 'it-assessment', label: 'Assessment de TI', icon: <CheckSquare size={16} /> },
                    { id: 'poc', label: 'Provas de Conceito POC', icon: <BarChart3 size={16} /> },
                    { 
                        id: 'site-survey', 
                        label: 'Site Survey', 
                        icon: <ClipboardList size={16} />,
                        href: '/site-survey'
                    }
                ]
            });
        }
        
        // Adiciona Ferramentas para usuários comuns também
        if (user?.role === 'user') {
            baseItems.push({
                id: 'tools',
                label: 'Ferramentas',
                icon: <Wrench size={20} />,
                subItems: [
                    { id: 'it-assessment', label: 'Assessment de TI', icon: <CheckSquare size={16} /> },
                    { id: 'poc', label: 'Provas de Conceito POC', icon: <BarChart3 size={16} /> },
                    { 
                        id: 'site-survey', 
                        label: 'Site Survey', 
                        icon: <ClipboardList size={16} />,
                        href: '/site-survey'
                    }
                ]
            });
        }
        
        // Adiciona relatórios apenas para diretor
        if (user?.role === 'diretor') {
            baseItems.push(
                { id: 'reports', label: 'Relatórios', icon: <FileText size={20} /> }
            );
        }

        return baseItems;
    }, [user?.role]);

    // Lógica para encontrar o item de navegação atual
    const currentNavItem = useMemo(() => {
        for (const item of navItems) {
            if (item.id === activeTab) return { ...item, parentLabel: null };
            if (item.href) continue;
            if (item.subItems) {
                const subItem = item.subItems.find(sub => sub.id === activeTab);
                if (subItem) return { ...subItem, parentLabel: item.label };
            }
        }
        return { ...navItems[0], parentLabel: null };
    }, [activeTab, navItems]);

    // Função para Renderizar o Conteúdo da View Ativa
    const renderContent = () => {
        const handleBackToPanel = () => setActiveTab('dashboard');

        if (!user) {
            return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;
        }

        // Verifica se o usuário tem permissão para acessar a aba atual
        const canAccessTab = () => {
            // Usuários admin podem acessar todas as abas
            if (user.role === 'admin') return true;
            
            // Usuários diretor podem acessar calculadoras, ferramentas e relatórios (sem dashboard)
            if (user.role === 'diretor') {
                const allowedTabs = [
                    'calculator-pabx-sip',
                    'calculator-maquinas-virtuais',
                    'calculator-fiber-link',
                    'calculator-radio-internet',
                    'calculator-double-radio-fibra',
                    'it-assessment',
                    'poc',
                    'site-survey',
                    'reports'
                ];
                return allowedTabs.includes(activeTab);
            }
            
            // Usuários comuns podem acessar apenas calculadoras e ferramentas (sem dashboard)
            if (user.role === 'user') {
                const allowedTabs = [
                    'calculator-pabx-sip',
                    'calculator-maquinas-virtuais',
                    'calculator-fiber-link',
                    'calculator-radio-internet',
                    'calculator-double-radio-fibra',
                    'it-assessment',
                    'poc',
                    'site-survey'
                ];
                return allowedTabs.includes(activeTab);
            }
            
            return false;
        };

        if (!canAccessTab()) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <h2 className="text-xl font-bold mb-2">Acesso não autorizado</h2>
                    <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
                    <Button onClick={handleBackToPanel}>
                        Voltar para o Painel
                    </Button>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard': 
                // Apenas admin pode acessar o dashboard completo
                if (user.role === 'admin') {
                    return <DashboardView userId={user.id} />;
                } else {
                    // Redireciona usuários e diretores para primeira calculadora
                    setActiveTab('calculator-pabx-sip');
                    return null;
                }
            case 'calculator-pabx-sip': 
                return <PABXSIPCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} userName={user.name} />;
            case 'calculator-maquinas-virtuais': 
                return <MaquinasVirtuaisCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} />;
            case 'calculator-fiber-link': 
                return <FiberLinkCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} />;
            case 'calculator-internet-man': 
                return <InternetMANCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} />;
            case 'calculator-radio-internet': 
                return <RadioInternetCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} />;
            case 'calculator-double-radio-fibra': 
                return <DoubleRadioFibraCalculator userRole={user?.role} onBackToPanel={handleBackToPanel} userId={user.id} userEmail={user.email} />;
            case 'it-assessment': 
                return <iframe src="/it-assessment.html" className="w-full h-screen border-0" title="Assessment de TI" />;
            case 'poc': 
                return <iframe src="/poc-management.html" className="w-full h-screen border-0" title="Provas de Conceito POC" />;
            case 'reports':
                // Apenas diretor e admin podem acessar relatórios
                if (user.role === 'diretor' || user.role === 'admin') {
                    return <ReportsView />;
                } else {
                    return (
                        <div className="flex flex-col items-center justify-center h-64">
                            <h2 className="text-xl font-bold mb-2">Acesso não autorizado</h2>
                            <p className="text-muted-foreground mb-4">Você não tem permissão para acessar relatórios.</p>
                        </div>
                    );
                }
            default: 
                // Redireciona para primeira calculadora por padrão
                setActiveTab('calculator-pabx-sip');
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen font-body bg-background text-foreground transition-colors duration-500">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-card shadow-xl flex-col h-screen sticky top-0 hidden md:flex">
                    {/* Cabeçalho da Sidebar */}
                    <div className="flex items-center justify-center h-20 border-b border-border">
                        <Briefcase className="w-8 h-8 text-primary" />
                        <span className="ml-3 text-xl font-bold text-foreground">Simuladores Double TI</span>
                    </div>
                    
                    {/* Navegação da Sidebar */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map(item => {
                            if (item.href) {
                                return (
                                    <a 
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {item.icon}
                                        <span className="ml-4">{item.label}</span>
                                    </a>
                                );
                            }
                            
                            if (item.subItems) {
                                return (
                                    <Collapsible
                                        key={item.id}
                                        defaultOpen={item.subItems.some(sub => sub.id === activeTab)}
                                    >
                                        <CollapsibleTrigger className={`w-full inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                                            item.subItems.some(sub => sub.id === activeTab) 
                                                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                                                : 'hover:bg-accent hover:text-accent-foreground'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="pl-6 mt-1 space-y-1">
                                            {item.subItems.map((subItem) => (
                                                <Button
                                                    key={subItem.id}
                                                    variant={subItem.id === activeTab ? 'secondary' : 'ghost'}
                                                    className="w-full justify-start gap-3"
                                                    onClick={() => setActiveTab(subItem.id)}
                                                >
                                                    {subItem.icon}
                                                    {subItem.label}
                                                </Button>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            }
                            
                            return (
                                <Button
                                    key={item.id}
                                    variant={item.id === activeTab ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-3"
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            );
                        })}
                    </nav>
                    
                    {/* Bottom of Sidebar */}
                    <div className="p-4 border-t border-border flex flex-col gap-2">
                        {/* Botão de Tema */}
                        <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="outline" className="w-full">
                            {mounted ? (
                                <>
                                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                                </>
                            ) : (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Mudar Tema
                                </>
                            )}
                        </Button>

                        {/* Botão de Logout */}
                        <Button onClick={handleLogout} variant="destructive" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </aside>

                {/* Conteúdo Principal da Página */}
                <main className="flex-1 p-6 sm:p-10 max-h-screen overflow-y-auto">
                    {/* Header da Main */}
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground capitalize">{currentNavItem.parentLabel || currentNavItem.label}</h1>
                            {currentNavItem.parentLabel && <p className="text-sm text-muted-foreground">{currentNavItem.label}</p>}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Botão para voltar ao Admin */}
                            {user?.role === 'admin' && (
                                <Button onClick={() => router.push('/admin')} variant="outline">
                                    Voltar ao Painel Administrador
                                </Button>
                            )}
                            
                            {/* Info do Usuário */}
                            <div className="text-right">
                                <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                            </div>
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-foreground" />
                            </div>
                        </div>
                    </header>

                    {/* Área de Conteúdo Principal */}
                    <div className="h-[calc(100%-100px)]">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
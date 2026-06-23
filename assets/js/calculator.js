/**
 * Calculator Module - Cotizador Dinamico v2
 * Service taxonomy, state management, price calculation, n8n webhook.
 */

(function () {
    'use strict';

    const N8N_WEBHOOK_URL = 'https://n8n.cambiodigital.cloud/webhook/c1692d85-8ad6-4977-b484-541c16463d0a';

    // ==========================================
    // SERVICE DATABASE
    // ==========================================
    const SERVICES_DB = [
        {
            category: 'whatsapp-demobot',
            categoryName: 'Automatizacion de WhatsApp (Entregas y Demos)',
            categoryIcon: 'message-circle',
            categoryDescription: 'Entrega automatica de demos y seguimientos comerciales por WhatsApp.',
            services: [
                {
                    id: 'whatsapp-demobot-system',
                    name: 'Sistema Automatizado de Demos (WhatsApp DemoBot)',
                    description: 'Entrega credenciales de prueba desde Google Sheets y convierte leads con seguimiento en Kommo CRM.',
                    basePrice: 160,
                    marketValue: 317,
                    priceType: 'one-time',
                    features: ['Entrega de Credenciales', 'Menu de Soporte y FAQs', 'Seguimiento de Conversion'],
                    extras: [
                        { id: 'demobot-cloud', name: 'Integracion Servidor en la Nube', price: 22, type: 'monthly', description: 'Operacion y monitoreo continuo de la integracion', required: true },
                        { id: 'demobot-kommo', name: 'Licencia Kommo Avanzado', price: 135, type: 'one-time', description: 'Costo por semestre de la licencia Kommo Avanzado', required: true }
                    ]
                }
            ]
        },
        {
            category: 'chatbots-ia',
            categoryName: 'Chatbots & Agentes IA',
            categoryIcon: 'bot',
            categoryDescription: 'Atención automática y ventas 24/7 por WhatsApp y redes sociales.',
            services: [
                {
                    id: 'chatbot-essential',
                    name: 'Chatbot Esencial',
                    description: 'Atención automática con árbol de decisiones. Respuestas rápidas 24/7.',
                    basePrice: 600,
                    marketValue: 900,
                    priceType: 'one-time',
                    features: ['Respuestas Rápidas', 'Lógica de Árbol', 'Multi-canal'],
                    extras: [
                        { id: 'ai-gpt', name: 'Inteligencia Artificial (GPT)', price: 75, type: 'monthly', description: 'Respuestas inteligentes con IA' },
                        { id: 'whatsapp-api', name: 'WhatsApp API Oficial', price: 45, type: 'monthly', description: 'Canal verificado de WhatsApp Business' },
                        { id: 'multi-language', name: 'Multiidioma (ES/EN)', price: 120, type: 'one-time', description: 'Soporte en español e inglés' }
                    ]
                },
                {
                    id: 'ai-sales-agent',
                    name: 'Agente IA de Ventas',
                    description: 'Califica leads, agenda citas y cierra ventas mientras tú duermes.',
                    basePrice: 700,
                    marketValue: 1100,
                    priceType: 'one-time',
                    features: ['Calificación de Leads', 'Agenda Automática', 'Seguimiento Inteligente'],
                    extras: [
                        { id: 'calendar-integration', name: 'Integración Google Calendar', price: 75, type: 'one-time', description: 'Agenda citas automáticamente' },
                        { id: 'crm-sync', name: 'Sincronización con CRM', price: 120, type: 'one-time', description: 'Datos sincronizados con tu CRM' },
                        { id: 'ai-token-premium', name: 'IA Premium (GPT-4)', price: 120, type: 'monthly', description: 'Respuestas avanzadas y contextuales' }
                    ]
                }
            ]
        },
        {
            category: 'mensajeria',
            categoryName: 'Mensajería & Comunicación',
            categoryIcon: 'send',
            categoryDescription: 'Envíos masivos, ciclos automáticos y formularios inteligentes.',
            services: [
                {
                    id: 'mass-messaging',
                    name: 'Mensajería Masiva',
                    description: 'Campañas a listas segmentadas por WhatsApp o email.',
                    basePrice: 225,
                    marketValue: 375,
                    priceType: 'one-time',
                    features: ['Segmentación', 'Plantillas', 'Reportes de Apertura'],
                    extras: [
                        { id: 'template-design', name: 'Diseño de Plantillas (x5)', price: 90, type: 'one-time', description: '5 plantillas profesionales' },
                        { id: 'whatsapp-broadcast', name: 'Canal WhatsApp Business', price: 45, type: 'monthly', description: 'Envíos por WhatsApp API' }
                    ]
                },
                {
                    id: 'welcome-farewell',
                    name: 'Ciclo Bienvenida / Despedida',
                    description: 'Secuencias automáticas cuando un cliente se une o se va.',
                    basePrice: 180,
                    marketValue: 300,
                    priceType: 'one-time',
                    features: ['Onboarding Automático', 'Encuesta de Salida', 'Triggers'],
                    extras: [
                        { id: 'custom-sequences', name: 'Secuencias Personalizadas (+3)', price: 60, type: 'one-time', description: '3 secuencias adicionales' }
                    ]
                },
                {
                    id: 'membership-reminders',
                    name: 'Recordatorios de Membresía',
                    description: 'Alertas automáticas de vencimiento, renovación y pagos.',
                    basePrice: 150,
                    marketValue: 270,
                    priceType: 'one-time',
                    features: ['Recordatorios Auto', 'Multi-canal', 'Escalamiento'],
                    extras: [
                        { id: 'payment-integration', name: 'Integración Pasarela de Pago', price: 120, type: 'one-time', description: 'Cobros automáticos' }
                    ]
                },
                {
                    id: 'review-forms',
                    name: 'Formularios de Reseña',
                    description: 'Encuestas post-servicio para recopilar testimonios.',
                    basePrice: 120,
                    marketValue: 225,
                    priceType: 'one-time',
                    features: ['NPS Score', 'Google Reviews', 'Post-Compra'],
                    extras: [
                        { id: 'google-review-push', name: 'Push a Google Reviews', price: 60, type: 'one-time', description: 'Envío directo a Google' }
                    ]
                }
            ]
        },
        {
            category: 'crm-automatizacion',
            categoryName: 'CRM & Automatización',
            categoryIcon: 'database',
            categoryDescription: 'Organiza clientes, automatiza procesos y elimina tareas repetitivas.',
            services: [
                {
                    id: 'crm-restructure',
                    name: 'Reestructuración CRM',
                    description: 'Auditamos y reorganizamos tu CRM para maximizar resultados.',
                    basePrice: 375,
                    marketValue: 675,
                    priceType: 'one-time',
                    features: ['Auditoría de Datos', 'Migración', 'Pipelines Optimizados'],
                    extras: [
                        { id: 'data-migration', name: 'Migración de Datos (+1000 reg)', price: 150, type: 'one-time', description: 'Migración masiva de datos' },
                        { id: 'custom-pipelines', name: 'Pipelines Personalizados (+3)', price: 120, type: 'one-time', description: '3 pipelines adicionales' }
                    ]
                },
                {
                    id: 'automation-audit',
                    name: 'Auditoría de Automatización',
                    description: 'Analizamos tus procesos y te decimos qué automatizar.',
                    basePrice: 300,
                    marketValue: 525,
                    priceType: 'one-time',
                    features: ['Mapa de Procesos', 'ROI Estimado', 'Plan de Implementación'],
                    extras: [
                        { id: 'implementation-plan', name: 'Plan Detallado de Implementación', price: 150, type: 'one-time', description: 'Roadmap paso a paso' }
                    ]
                }
            ]
        },
        {
            category: 'integraciones',
            categoryName: 'Integraciones',
            categoryIcon: 'plug',
            categoryDescription: 'Conecta WhatsApp con transporte, bases de datos y más.',
            services: [
                {
                    id: 'whatsapp-shipping',
                    name: 'WhatsApp + Transporte',
                    description: 'Tracking automático de pedidos y notificaciones de envío.',
                    basePrice: 450,
                    marketValue: 750,
                    priceType: 'one-time',
                    features: ['Tracking Automático', 'Notificaciones', 'Confirmación Entrega'],
                    extras: [
                        { id: 'multi-carrier', name: 'Multi-Transportadora', price: 180, type: 'one-time', description: 'Soporte para múltiples carriers' }
                    ]
                },
                {
                    id: 'external-db',
                    name: 'Conexión Base de Datos Externa',
                    description: 'Conecta ERP, inventario o contabilidad con tu CRM y bots.',
                    basePrice: 525,
                    marketValue: 900,
                    priceType: 'one-time',
                    features: ['API REST', 'Sync Bidireccional', 'Monitoreo'],
                    extras: [
                        { id: 'realtime-sync', name: 'Sincronización Tiempo Real', price: 150, type: 'monthly', description: 'Datos siempre actualizados' }
                    ]
                }
            ]
        },
        {
            category: 'web',
            categoryName: 'Desarrollo Web',
            categoryIcon: 'globe',
            categoryDescription: 'Desde landing pages hasta tiendas completas.',
            services: [
                {
                    id: 'web-basic',
                    name: 'Página Web Básica',
                    description: 'Hasta 3 secciones. Presencia digital rápida y profesional.',
                    basePrice: 600,
                    marketValue: 975,
                    priceType: 'one-time',
                    features: ['3 Secciones', 'Responsive', 'SEO Básico'],
                    extras: [
                        { id: 'copywriting', name: 'Redacción Profesional', price: 75, type: 'one-time', description: 'Textos persuasivos' },
                        { id: 'advanced-form', name: 'Formulario Avanzado', price: 30, type: 'one-time', description: 'Validación y lógica avanzada' }
                    ]
                },
                {
                    id: 'web-custom',
                    name: 'Página Web Personalizada',
                    description: 'Diseño a medida con SEO avanzado e integraciones.',
                    basePrice: 1200,
                    marketValue: 1800,
                    priceType: 'one-time',
                    features: ['Diseño a Medida', 'SEO Técnico', 'Integraciones'],
                    extras: [
                        { id: 'chatbot-integration', name: 'Chatbot Integrado', price: 225, type: 'one-time', description: 'Bot directamente en tu web' },
                        { id: 'extra-section', name: 'Sección Extra', price: 60, type: 'counter', description: '$60 por sección adicional' }
                    ]
                },
                {
                    id: 'ecommerce',
                    name: 'Tienda E-Commerce',
                    description: 'Catálogo completo, pasarelas de pago y panel admin.',
                    basePrice: 3600,
                    marketValue: 5250,
                    priceType: 'one-time',
                    features: ['Pasarelas de Pago', 'Catálogo Amplio', 'Panel Admin'],
                    extras: [
                        { id: 'priority-load', name: 'Optimización de Carga', price: 300, type: 'one-time', description: 'Velocidad prioritaria' },
                        { id: 'product-upload', name: 'Carga de Productos (+50)', price: 150, type: 'one-time', description: 'Subimos 50+ productos' }
                    ]
                },
                {
                    id: 'web-maintenance',
                    name: 'Mantenimiento Web',
                    description: 'Actualizaciones, backups, monitoreo y soporte continuo.',
                    basePrice: 75,
                    marketValue: 150,
                    priceType: 'monthly',
                    features: ['Backups Semanales', 'Actualizaciones', 'Monitoreo'],
                    extras: [
                        { id: 'content-updates', name: 'Actualizaciones de Contenido (4/mes)', price: 45, type: 'monthly', description: '4 cambios mensuales' }
                    ]
                }
            ]
        },
        {
            category: 'erp-gestion',
            categoryName: 'ERP / Gestión Empresarial',
            categoryIcon: 'building-2',
            categoryDescription: 'ERP open source, inventario, producción y reportes. Centraliza tu operación.',
            services: [
                {
                    id: 'erp-diagnostico',
                    name: 'Diagnóstico ERP',
                    description: 'Analizamos tus procesos y definimos si necesitas ERP, CRM o automatización.',
                    basePrice: 0,
                    marketValue: 150,
                    priceType: 'one-time',
                    features: ['Llamada de Descubrimiento', 'Mapa de Procesos', 'Módulos Requeridos', 'Estimación de Alcance'],
                    extras: []
                },
                {
                    id: 'erp-base',
                    name: 'ERP Base Pyme',
                    description: 'Clientes, productos, ventas, compras y reportes básicos. Ideal para empezar.',
                    basePrice: 900,
                    marketValue: 1800,
                    priceType: 'one-time',
                    features: ['Clientes y Productos', 'Ventas y Compras', 'Reportes Iniciales', 'Capacitación Básica'],
                    extras: [
                        { id: 'erp-migracion', name: 'Migración de Datos', price: 0, type: 'one-time', description: 'Cotizar aparte según volumen' },
                        { id: 'erp-integracion', name: 'Integración Simple (WhatsApp, web, API)', price: 300, type: 'one-time', description: 'Por integración' },
                        { id: 'erp-soporte-mensual', name: 'ERP Gestionado Básico (servicio mensual)', price: 150, type: 'monthly', description: 'Hosting gestionado, backups, revisiones y soporte por incidencias. Hasta 1h/mes de ajustes.' }
                    ]
                },
                {
                    id: 'erp-operativo',
                    name: 'ERP Operativo',
                    description: 'Inventario, flujos de aprobación, dashboards y automatizaciones internas.',
                    basePrice: 2500,
                    marketValue: 4500,
                    priceType: 'one-time',
                    features: ['Inventario y Almacenes', 'Flujos de Aprobación', 'Dashboards', 'Automatizaciones'],
                    extras: [
                        { id: 'erp-operativo-migracion', name: 'Migración de Datos', price: 0, type: 'one-time', description: 'Cotizar aparte según volumen' },
                        { id: 'erp-operativo-integracion', name: 'Integración Simple (WhatsApp, web, API)', price: 300, type: 'one-time', description: 'Por integración' },
                        { id: 'erp-soporte-evolucion', name: 'ERP Gestionado Operativo (servicio mensual)', price: 300, type: 'monthly', description: 'Revisiones de integraciones, hasta 3h/mes de soporte, ajustes o capacitación. Priorización de incidencias.' }
                    ]
                },
                {
                    id: 'erp-produccion',
                    name: 'ERP Producción / Mantenimiento',
                    description: 'Órdenes de trabajo, máquinas, incidencias, repuestos y trazabilidad.',
                    basePrice: 4500,
                    marketValue: 7500,
                    priceType: 'one-time',
                    features: ['Producción', 'Órdenes de Trabajo', 'Mantenimiento', 'Reportes de Productividad'],
                    extras: [
                        { id: 'erp-prod-migracion', name: 'Migración de Datos', price: 0, type: 'one-time', description: 'Cotizar aparte según volumen' },
                        { id: 'erp-prod-integracion', name: 'Integración Personalizada', price: 500, type: 'one-time', description: 'Por integración compleja' },
                        { id: 'erp-soporte-avanzado', name: 'ERP Gestionado Avanzado (servicio mensual)', price: 500, type: 'monthly', description: 'Mayor capacidad de soporte, seguimiento de mejoras, reuniones de evolución, soporte prioritario y plan de crecimiento tecnológico.' }
                    ]
                }
            ]
        },
        {
            category: 'consultoria',
            categoryName: 'Consultoría & Estrategia',
            categoryIcon: 'compass',
            categoryDescription: 'Para quienes no saben por dónde empezar. Te guiamos.',
            services: [
                {
                    id: 'brand-study',
                    name: 'Estudio de Marca e Identidad',
                    description: 'Definimos tu identidad visual, tono y posicionamiento.',
                    basePrice: 450,
                    marketValue: 750,
                    priceType: 'one-time',
                    features: ['Logo + Paleta', 'Manual de Marca', 'Tono de Voz'],
                    extras: [
                        { id: 'social-kit', name: 'Kit Redes Sociales', price: 120, type: 'one-time', description: 'Plantillas para redes' }
                    ]
                },
                {
                    id: 'automation-consulting',
                    name: 'Consultoría de Automatización',
                    description: 'Sesiones 1-a-1 para mapear oportunidades y priorizar.',
                    basePrice: 225,
                    marketValue: 450,
                    priceType: 'one-time',
                    features: ['2 Sesiones (1h)', 'Roadmap', 'Priorización ROI'],
                    extras: [
                        { id: 'extra-session', name: 'Sesión Adicional', price: 90, type: 'one-time', description: '1 hora extra de consultoría' }
                    ]
                },
                {
                    id: 'it-partner-standard',
                    name: 'IT Partner Estándar',
                    description: 'Tu departamento IT externo. Soporte prioritario y revisiones.',
                    basePrice: 100,
                    marketValue: 225,
                    priceType: 'monthly',
                    features: ['SLA <2h', 'Revisión Semanal', '2h Capacitación/mes'],
                    setupFee: 300,
                    setupLabel: 'Fase de Estabilización (3 meses)',
                    extras: []
                },
                {
                    id: 'it-partner-evolution',
                    name: 'IT Partner Evolución',
                    description: 'Todo lo del Estándar + implementaciones mensuales y SLA VIP.',
                    basePrice: 300,
                    marketValue: 750,
                    priceType: 'monthly',
                    features: ['SLA VIP Inmediato', '1 Configuración Nueva/mes', '4h Capacitación/mes'],
                    setupFee: 600,
                    setupLabel: 'Fase de Estabilización (3 meses)',
                    extras: []
                }
            ]
        }
    ];

    // ==========================================
    // DIAGNOSTIC QUIZ
    // ==========================================
    const QUIZ_QUESTIONS = [
        {
            question: '¿Qué te quita más tiempo en tu día a día?',
            options: [
                { label: 'Responder mensajes de clientes', value: 'messages', recommend: ['chatbots-ia', 'mensajeria'] },
                { label: 'Tareas manuales repetitivas', value: 'manual', recommend: ['crm-automatizacion', 'integraciones'] },
                { label: 'Gestionar clientes y datos', value: 'clients', recommend: ['crm-automatizacion'] },
                { label: 'Todo lo anterior', value: 'all', recommend: ['chatbots-ia', 'crm-automatizacion', 'mensajeria'] }
            ]
        },
        {
            question: '¿Tienes página web?',
            options: [
                { label: 'Sí, pero necesita mejoras', value: 'improve', recommend: ['web'] },
                { label: 'No tengo', value: 'no', recommend: ['web'] },
                { label: 'Sí, está bien por ahora', value: 'yes', recommend: [] }
            ]
        },
        {
            question: '¿Manejas inventario, producción o necesitas centralizar ventas y compras?',
            options: [
                { label: 'Sí, necesito ordenar varias áreas del negocio', value: 'erp-yes', recommend: ['erp-gestion'] },
                { label: 'Solo necesito organizar clientes y ventas', value: 'crm-only', recommend: ['crm-automatizacion'] },
                { label: 'No, mi operación es simple', value: 'simple', recommend: [] }
            ]
        },
        {
            question: '¿Qué es lo más urgente para ti?',
            options: [
                { label: 'Vender más sin contratar', value: 'sell', recommend: ['chatbots-ia'] },
                { label: 'Organizar mi negocio', value: 'organize', recommend: ['crm-automatizacion', 'erp-gestion'] },
                { label: 'Tener presencia online profesional', value: 'online', recommend: ['web', 'consultoria'] },
                { label: 'Soporte técnico confiable', value: 'support', recommend: ['consultoria'] }
            ]
        }
    ];

    // ==========================================
    // STATE
    // ==========================================
    const state = {
        step: 1,
        selectedServices: {},
        extras: {},
        counters: {},
        quizAnswers: [],
        recommendedCategories: [],
        customer: {},
        hashApplied: false
    };

    // ==========================================
    // HELPERS
    // ==========================================
    function getServiceById(id) {
        for (const cat of SERVICES_DB) {
            for (const svc of cat.services) {
                if (svc.id === id) return svc;
            }
        }
        return null;
    }

    function calculateTotals() {
        let oneTime = 0;
        let monthly = 0;
        let marketValue = 0;

        for (const [serviceId, selected] of Object.entries(state.selectedServices)) {
            if (!selected) continue;
            const svc = getServiceById(serviceId);
            if (!svc) continue;

            marketValue += svc.marketValue || 0;

            if (svc.priceType === 'monthly') {
                monthly += svc.basePrice;
            } else {
                oneTime += svc.basePrice;
            }

            if (svc.setupFee) {
                oneTime += svc.setupFee;
            }

            // Extras (including required ones)
            const svcExtras = state.extras[serviceId] || {};
            for (const extra of svc.extras) {
                const isExtraSelected = svcExtras[extra.id];
                const shouldInclude = extra.required || isExtraSelected;
                if (!shouldInclude) continue;

                if (extra.type === 'monthly') {
                    monthly += extra.price;
                } else if (extra.type === 'counter') {
                    const count = state.counters[`${serviceId}-${extra.id}`] || 1;
                    oneTime += extra.price * count;
                } else {
                    oneTime += extra.price;
                }
            }
        }

        const savings = marketValue - (oneTime + monthly * 3);
        return { oneTime, monthly, marketValue, savings: Math.max(0, savings) };
    }

    function getSelectedCount() {
        return Object.values(state.selectedServices).filter(Boolean).length;
    }

    function getERPManagedServiceRecommendation() {
        const selectedERPIds = Object.entries(state.selectedServices)
            .filter(([k, v]) => v && k.startsWith('erp-') && k !== 'erp-diagnostico' && !k.endsWith('-selected'))
            .map(([k]) => getServiceById(k))
            .filter(Boolean);

        if (selectedERPIds.length === 0) return null;

        const needsAdvanced = selectedERPIds.some(s =>
            s.id === 'erp-produccion' ||
            s.id === 'erp-operativo'
        );
        const needsOperative = selectedERPIds.some(s =>
            s.id === 'erp-operativo' ||
            s.id === 'erp-base'
        );

        if (needsAdvanced && selectedERPIds.some(s => s.id === 'erp-produccion')) {
            return {
                level: 'avanzado',
                title: 'ERP Gestionado Avanzado',
                price: '$500 USD/mes',
                reason: 'Tu empresa maneja producción, mantenimiento u operaciones críticas. Recomendamos el plan avanzado para tener seguimiento de mejoras, soporte prioritario y un plan de crecimiento tecnológico.',
                extraId: 'erp-soporte-avanzado'
            };
        }
        if (needsOperative) {
            return {
                level: 'operativo',
                title: 'ERP Gestionado Operativo',
                price: '$300 USD/mes',
                reason: 'Tu ERP es parte importante de la operación diaria. Recomendamos al menos el plan operativo con revisiones de integraciones, priorización de incidencias y hasta 3h/mes de soporte.',
                extraId: 'erp-soporte-evolucion'
            };
        }
        return {
            level: 'basico',
            title: 'ERP Gestionado Básico',
            price: '$150 USD/mes',
            reason: 'Para mantener tu ERP online, respaldado y con soporte básico, te recomendamos el plan de gestión mensual.',
            extraId: 'erp-soporte-mensual'
        };
    }

    // ==========================================
    // RENDERING
    // ==========================================
    function render() {
        const container = document.getElementById('calculator-app');
        if (!container) return;

        if (state.step === 1) renderStep1(container);
        else if (state.step === 2) renderStep2(container);
        else if (state.step === 3) renderStep3(container);

        if (window.lucide) window.lucide.createIcons();
    }

    function renderStepIndicator() {
        return `
        <div class="flex items-center justify-center gap-2 mb-10">
            <div class="step-dot ${state.step >= 1 ? (state.step > 1 ? 'completed' : 'active') : ''}">
                ${state.step > 1 ? '<i data-lucide="check" class="w-4 h-4"></i>' : '1'}
            </div>
            <div class="step-line ${state.step > 1 ? 'active' : ''}"></div>
            <div class="step-dot ${state.step >= 2 ? (state.step > 2 ? 'completed' : 'active') : ''}">
                ${state.step > 2 ? '<i data-lucide="check" class="w-4 h-4"></i>' : '2'}
            </div>
            <div class="step-line ${state.step > 2 ? 'active' : ''}"></div>
            <div class="step-dot ${state.step >= 3 ? 'active' : ''}">3</div>
        </div>`;
    }

    function renderStep1(container) {
        const hash = window.location.hash.replace('#', '');
        container.innerHTML = `
        ${renderStepIndicator()}
        <div class="text-center mb-10">
            <h2 class="text-3xl md:text-4xl font-black mb-3">¿Qué necesitas?</h2>
            <p class="text-cd-text-dim max-w-xl mx-auto">Selecciona las categorías que te interesan. Puedes elegir varias.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            ${SERVICES_DB.map(cat => `
                <button onclick="window.calcSelectCategory('${cat.category}')"
                    class="card-modern text-left p-6 ${state.selectedServices[cat.category + '-selected'] ? 'border-cd-highlight ring-2 ring-cd-highlight' : ''}">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--cd-surface);">
                            <i data-lucide="${cat.categoryIcon}" class="w-5 h-5" style="color: var(--cd-highlight-color);"></i>
                        </div>
                        <h3 class="font-bold text-lg">${cat.categoryName}</h3>
                    </div>
                    <p class="text-sm text-cd-text-dim">${cat.categoryDescription}</p>
                    <p class="text-xs text-cd-text-dim mt-2">${cat.services.length} servicio${cat.services.length > 1 ? 's' : ''}</p>
                </button>
            `).join('')}
        </div>

        <div class="text-center mb-8">
            <div class="section-divider mb-6"></div>
            <button onclick="window.calcStartQuiz()" class="btn-secondary text-sm">
                <i data-lucide="help-circle" class="w-4 h-4"></i>
                No sé por dónde empezar
            </button>
        </div>

        <div id="quiz-container"></div>

        <div class="flex justify-center mt-8">
            <button onclick="window.calcGoToStep(2)" class="btn-primary text-lg px-10 py-3 ${getSelectedCount() === 0 ? 'opacity-50 pointer-events-none' : ''}">
                Continuar <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
        </div>`;

        // Auto-select from hash (only once on first load)
        if (hash && !state.hashApplied) {
            state.hashApplied = true;
            const cat = SERVICES_DB.find(c => c.category === hash);
            if (cat) {
                state.selectedServices[hash + '-selected'] = true;
                cat.services.forEach(s => { state.selectedServices[s.id] = false; });
            }
        }
    }

    function renderStep2(container) {
        const totals = calculateTotals();
        const selectedCategories = SERVICES_DB.filter(cat =>
            state.selectedServices[cat.category + '-selected'] ||
            cat.services.some(s => state.selectedServices[s.id])
        );

        container.innerHTML = `
        ${renderStepIndicator()}
        <div class="text-center mb-10">
            <h2 class="text-3xl md:text-4xl font-black mb-3">Personaliza tu plan</h2>
            <p class="text-cd-text-dim max-w-xl mx-auto">Selecciona los servicios y extras que necesitas.</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <!-- Services List -->
            <div class="flex-1 space-y-6">
                ${selectedCategories.map(cat => `
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <i data-lucide="${cat.categoryIcon}" class="w-5 h-5" style="color: var(--cd-highlight-color);"></i>
                            <h3 class="font-bold text-lg">${cat.categoryName}</h3>
                        </div>
                        <div class="space-y-3">
                            ${cat.services.map(svc => renderServiceCard(svc)).join('')}
                        </div>
                    </div>
                `).join('')}

                ${(function() {
                    const erpRec = getERPManagedServiceRecommendation();
                    if (!erpRec) return '';
                    return `
                    <div class="card-modern p-6 mt-4" style="border-color: var(--cd-highlight-color); box-shadow: 0 0 0 1px var(--cd-highlight-color);">
                        <div class="flex items-center gap-3 mb-3">
                            <i data-lucide="shield-check" class="w-5 h-5" style="color: var(--cd-highlight-color);"></i>
                            <h4 class="font-bold text-base">Servicio ERP Gestionado Mensual</h4>
                        </div>
                        <p class="text-sm text-cd-text-dim mb-3">${erpRec.reason}</p>
                        <p class="text-xs text-cd-text-dim mb-3">Un ERP no termina el dia que se instala. El servicio mensual gestionado cubre infraestructura, mantenimiento, disponibilidad tecnica, soporte y acompanamiento continuo. Aunque un mes no se soliciten cambios, mantiene activa la supervision y la capacidad de respuesta del equipo.</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-xs px-3 py-1 rounded-full font-semibold" style="background: var(--cd-highlight-color); color: white;">${erpRec.title} — ${erpRec.price}</span>
                            <span class="text-xs px-3 py-1 rounded-full" style="background: var(--cd-surface); color: var(--cd-text-dim);">Incluye hosting, backups, soporte y acompanamiento</span>
                        </div>
                        <p class="text-xs text-cd-text-dim mt-3">
                            <i data-lucide="info" class="w-3.5 h-3.5 inline-block mr-1"></i>
                            Selecciona el plan en los extras de tu servicio ERP arriba para incluirlo en la cotizacion.
                        </p>
                    </div>`;
                })()}

                <button onclick="window.calcGoToStep(1)" class="btn-secondary text-sm mt-4">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Agregar más categorías
                </button>
            </div>

            <!-- Summary Sidebar -->
            <div class="lg:w-80 lg:sticky lg:top-24 lg:self-start">
                ${renderSummary(totals)}
            </div>
        </div>`;
    }

    function renderServiceCard(svc) {
        const isSelected = state.selectedServices[svc.id];
        const svcExtras = state.extras[svc.id] || {};
        const isRecommended = state.recommendedCategories.length > 0;

        return `
        <div onclick="window.calcToggleService('${svc.id}')" class="card-modern cursor-pointer ${isSelected ? 'border-cd-highlight' : ''}" style="${isSelected ? 'box-shadow: 0 0 0 1px var(--cd-highlight-color);' : ''}">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-bold">${svc.name}</h4>
                        ${svc.setupFee ? '<span class="badge text-xs">Suscripción</span>' : ''}
                    </div>
                    <p class="text-sm text-cd-text-dim mb-2">${svc.description}</p>
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${svc.features.map(f => `<span class="text-xs px-2 py-0.5 rounded-full" style="background: var(--cd-surface); color: var(--cd-text-muted);">${f}</span>`).join('')}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-lg" style="color: var(--cd-highlight-color);">$${svc.basePrice} USD${svc.priceType === 'monthly' ? '/mes' : ''}</span>
                        <span class="text-sm text-cd-text-dim line-through">$${svc.marketValue}</span>
                        ${svc.setupFee ? `<span class="text-xs text-cd-text-dim">+ $${svc.setupFee} inicio</span>` : ''}
                    </div>
                </div>
                <button
                    class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-cd-highlight text-white' : ''}"
                    style="${!isSelected ? 'background: var(--cd-surface); color: var(--cd-text-dim);' : 'background: var(--cd-highlight-color);'}">
                    <i data-lucide="${isSelected ? 'check' : 'plus'}" class="w-5 h-5"></i>
                </button>
            </div>

            ${isSelected && svc.extras.length > 0 ? `
                <div class="mt-4 pt-4 space-y-2" style="border-top: 1px solid var(--cd-border);" onclick="event.stopPropagation()">
                    <p class="text-xs font-semibold text-cd-text-dim uppercase tracking-wider mb-2">Extras ${svc.extras.some(e => e.required) ? '(requeridos y opcionales)' : 'opcionales'}</p>
                    ${svc.extras.map(extra => {
            const extraSelected = svcExtras[extra.id];
            if (extra.type === 'counter') {
                const count = state.counters[`${svc.id}-${extra.id}`] || 1;
                return `
                            <div class="flex items-center justify-between p-3 rounded-lg" style="background: var(--cd-surface);">
                                <div>
                                    <p class="text-sm font-semibold">${extra.name}</p>
                                    <p class="text-xs text-cd-text-dim">${extra.description}</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-bold" style="color: var(--cd-highlight-color);">$${extra.price * count}</span>
                                    <button onclick="window.calcUpdateCounter('${svc.id}', '${extra.id}', -1)" class="w-7 h-7 rounded flex items-center justify-center text-sm" style="background: var(--cd-base);">-</button>
                                    <span class="text-sm font-bold w-6 text-center">${count}</span>
                                    <button onclick="window.calcUpdateCounter('${svc.id}', '${extra.id}', 1)" class="w-7 h-7 rounded flex items-center justify-center text-sm" style="background: var(--cd-base);">+</button>
                                </div>
                            </div>`;
            }
            if (extra.required) {
                return `
                        <div class="flex items-center justify-between p-3 rounded-lg" style="background: rgba(90,130,255,0.1); border: 1px solid var(--cd-highlight-color);">
                            <div class="flex-1">
                                <p class="text-sm font-semibold">${extra.name}</p>
                                <p class="text-xs text-cd-text-dim">${extra.description}</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-bold" style="color: var(--cd-highlight-color);">+$${extra.price}${extra.type === 'monthly' ? '/mes' : ''}</span>
                                <span class="text-xs px-2 py-1 rounded" style="background: var(--cd-highlight-color); color: white;">Requerido</span>
                            </div>
                        </div>`;
            }
            return `
                        <label class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80" style="background: var(--cd-surface);">
                            <div class="flex-1">
                                <p class="text-sm font-semibold">${extra.name}</p>
                                <p class="text-xs text-cd-text-dim">${extra.description}</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-bold" style="color: var(--cd-highlight-color);">+$${extra.price}${extra.type === 'monthly' ? '/mes' : ''}</span>
                                <input type="checkbox" ${extraSelected ? 'checked' : ''} onchange="window.calcToggleExtra('${svc.id}', '${extra.id}')"
                                    class="w-5 h-5 rounded accent-cd-highlight">
                            </div>
                        </label>`;
        }).join('')}
                </div>
            ` : ''}
        </div>`;
    }

    function renderSummary(totals) {
        const selectedList = Object.entries(state.selectedServices)
            .filter(([k, v]) => v && !k.endsWith('-selected'))
            .map(([k]) => getServiceById(k))
            .filter(Boolean);

        return `
        <div class="card-modern p-6 sticky top-24">
            <h3 class="font-bold text-lg mb-4">Resumen</h3>

            ${selectedList.length === 0 ? `
                <p class="text-sm text-cd-text-dim text-center py-8">Selecciona servicios para ver el resumen</p>
            ` : `
                <div class="space-y-3 mb-4">
                    ${selectedList.map(svc => `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-cd-text-muted font-semibold">${svc.name}</span>
                                <span class="font-semibold">$${svc.basePrice}${svc.priceType === 'monthly' ? '/mes' : ''}</span>
                            </div>
                            ${svc.extras.filter(e => e.required).length > 0 ? `
                                <div class="ml-2 space-y-0.5 text-xs text-cd-text-dim">
                                    ${svc.extras.filter(e => e.required).map(e => `
                                        <div class="flex justify-between">
                                            <span>&nbsp;&nbsp;• ${e.name}</span>
                                            <span>+$${e.price}${e.type === 'monthly' ? '/mes' : ''}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="pt-4 space-y-2" style="border-top: 1px solid var(--cd-border);">
                    ${totals.oneTime > 0 ? `
                        <div class="flex justify-between">
                            <span class="text-sm text-cd-text-dim">Pago único</span>
                            <span class="font-bold text-lg">$${totals.oneTime.toLocaleString()} USD</span>
                        </div>
                    ` : ''}
                    ${totals.monthly > 0 ? `
                        <div class="flex justify-between">
                            <span class="text-sm text-cd-text-dim">Mensual</span>
                            <span class="font-bold text-lg">$${totals.monthly.toLocaleString()} USD/mes</span>
                        </div>
                    ` : ''}
                    ${totals.savings > 0 ? `
                        <div class="flex justify-between items-center mt-2 p-2 rounded-lg" style="background: rgba(34, 197, 94, 0.1);">
                            <span class="text-sm text-green-400">Ahorras</span>
                            <span class="font-bold text-green-400">$${totals.savings.toLocaleString()} USD</span>
                        </div>
                    ` : ''}
                </div>
            `}

            <button onclick="window.calcGoToStep(3)" class="btn-primary w-full mt-6 justify-center py-3 ${selectedList.length === 0 ? 'opacity-50 pointer-events-none' : ''}">
                Solicitar Cotización <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>`;
    }

    function renderStep3(container) {
        const totals = calculateTotals();
        const selectedList = Object.entries(state.selectedServices)
            .filter(([k, v]) => v && !k.endsWith('-selected'))
            .map(([k]) => getServiceById(k))
            .filter(Boolean);

        container.innerHTML = `
        ${renderStepIndicator()}
        <div class="text-center mb-10">
            <h2 class="text-3xl md:text-4xl font-black mb-3">Recibe tu cotización</h2>
            <p class="text-cd-text-dim max-w-xl mx-auto">Completa tus datos y te enviaremos la propuesta detallada.</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            <div class="flex-1">
                <form id="quote-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Nombre completo *</label>
                        <input type="text" id="q-name" required placeholder="Tu nombre"
                            class="w-full px-4 py-3 rounded-lg text-sm" style="background: var(--cd-input-bg); border: 1px solid var(--cd-input-border); color: var(--cd-cream);">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Empresa</label>
                        <input type="text" id="q-company" placeholder="Nombre de tu empresa"
                            class="w-full px-4 py-3 rounded-lg text-sm" style="background: var(--cd-input-bg); border: 1px solid var(--cd-input-border); color: var(--cd-cream);">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Email *</label>
                        <input type="email" id="q-email" required placeholder="tu@email.com"
                            class="w-full px-4 py-3 rounded-lg text-sm" style="background: var(--cd-input-bg); border: 1px solid var(--cd-input-border); color: var(--cd-cream);">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">WhatsApp / Teléfono *</label>
                        <input type="tel" id="q-phone" required placeholder="+57 312 290 8416"
                            class="w-full px-4 py-3 rounded-lg text-sm" style="background: var(--cd-input-bg); border: 1px solid var(--cd-input-border); color: var(--cd-cream);">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Comentarios adicionales</label>
                        <textarea id="q-comments" rows="3" placeholder="Cuéntanos más sobre tu proyecto..."
                            class="w-full px-4 py-3 rounded-lg text-sm resize-none" style="background: var(--cd-input-bg); border: 1px solid var(--cd-input-border); color: var(--cd-cream);"></textarea>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="window.calcGoToStep(2)" class="btn-secondary flex-1 justify-center py-3">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver
                        </button>
                        <button type="submit" id="q-submit" class="btn-primary flex-1 justify-center py-3">
                            Enviar Cotización <i data-lucide="send" class="w-4 h-4"></i>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Final Summary -->
            <div class="lg:w-80">
                <div class="card-modern p-6">
                    <h3 class="font-bold mb-4">Tu selección</h3>
                    <div class="space-y-2 mb-4">
                        ${selectedList.map(svc => `
                            <div class="flex justify-between text-sm">
                                <span class="text-cd-text-muted">${svc.name}</span>
                                <span class="font-semibold">$${svc.basePrice}${svc.priceType === 'monthly' ? '/mes' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pt-4 space-y-2" style="border-top: 1px solid var(--cd-border);">
                        ${totals.oneTime > 0 ? `
                            <div class="flex justify-between">
                                <span class="text-sm text-cd-text-dim">Pago único</span>
                                <span class="font-bold">$${totals.oneTime.toLocaleString()} USD</span>
                            </div>
                        ` : ''}
                        ${totals.monthly > 0 ? `
                            <div class="flex justify-between">
                                <span class="text-sm text-cd-text-dim">Mensual</span>
                                <span class="font-bold">$${totals.monthly.toLocaleString()} USD/mes</span>
                            </div>
                        ` : ''}
                    </div>
                    <p class="text-xs text-cd-text-dim mt-4">* Precios estimados. La cotización final puede variar según evaluación técnica.</p>
                </div>
            </div>
        </div>`;

        // Form submit handler
        setTimeout(() => {
            const form = document.getElementById('quote-form');
            if (form) form.addEventListener('submit', handleSubmit);
        }, 100);
    }

    // ==========================================
    // ACTIONS
    // ==========================================
    window.calcSelectCategory = function (categoryId) {
        const key = categoryId + '-selected';
        state.selectedServices[key] = !state.selectedServices[key];

        if (state.selectedServices[key]) {
            const cat = SERVICES_DB.find(c => c.category === categoryId);
            if (cat) cat.services.forEach(s => {
                if (state.selectedServices[s.id] === undefined) state.selectedServices[s.id] = false;
            });
        }

        render();
    };

    window.calcToggleService = function (serviceId) {
        state.selectedServices[serviceId] = !state.selectedServices[serviceId];
        if (!state.selectedServices[serviceId]) {
            delete state.extras[serviceId];
        } else {
            // Auto-select required extras
            const svc = getServiceById(serviceId);
            if (svc && svc.extras.length > 0) {
                if (!state.extras[serviceId]) state.extras[serviceId] = {};
                svc.extras.forEach(extra => {
                    if (extra.required) {
                        state.extras[serviceId][extra.id] = true;
                    }
                });
            }
        }
        render();
    };

    window.calcToggleExtra = function (serviceId, extraId) {
        if (!state.extras[serviceId]) state.extras[serviceId] = {};
        state.extras[serviceId][extraId] = !state.extras[serviceId][extraId];
        render();
    };

    window.calcUpdateCounter = function (serviceId, extraId, delta) {
        const key = `${serviceId}-${extraId}`;
        if (!state.extras[serviceId]) state.extras[serviceId] = {};
        state.extras[serviceId][extraId] = true;
        state.counters[key] = Math.max(1, (state.counters[key] || 1) + delta);
        render();
    };

    window.calcGoToStep = function (step) {
        if (step === 2 && getSelectedCount() === 0) {
            // Auto-select all services in selected categories
            SERVICES_DB.forEach(cat => {
                if (state.selectedServices[cat.category + '-selected']) {
                    cat.services.forEach(s => {
                        if (!state.selectedServices[s.id]) state.selectedServices[s.id] = false;
                    });
                }
            });
        }
        state.step = step;
        render();
        window.scrollTo({ top: document.getElementById('calculator-app').offsetTop - 100, behavior: 'smooth' });
    };

    window.calcStartQuiz = function () {
        state.quizAnswers = [];
        state.recommendedCategories = [];
        renderQuizQuestion(0);
    };

    function renderQuizQuestion(index) {
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer || index >= QUIZ_QUESTIONS.length) {
            // Quiz complete - apply recommendations
            applyQuizRecommendations();
            return;
        }

        const q = QUIZ_QUESTIONS[index];
        quizContainer.innerHTML = `
        <div class="card-modern max-w-xl mx-auto p-6 animate-fade-in">
            <p class="text-xs text-cd-text-dim mb-1">Pregunta ${index + 1} de ${QUIZ_QUESTIONS.length}</p>
            <h3 class="font-bold text-lg mb-4">${q.question}</h3>
            <div class="space-y-2">
                ${q.options.map(opt => `
                    <button onclick="window.calcAnswerQuiz(${index}, '${opt.value}')"
                        class="w-full text-left p-3 rounded-lg text-sm font-medium transition-colors"
                        style="background: var(--cd-surface); border: 1px solid var(--cd-border);"
                        onmouseover="this.style.borderColor='var(--cd-highlight-color)'"
                        onmouseout="this.style.borderColor='var(--cd-border)'">
                        ${opt.label}
                    </button>
                `).join('')}
            </div>
        </div>`;
    }

    window.calcAnswerQuiz = function (index, value) {
        const q = QUIZ_QUESTIONS[index];
        const selected = q.options.find(o => o.value === value);
        if (selected) {
            state.quizAnswers.push(value);
            selected.recommend.forEach(cat => {
                if (!state.recommendedCategories.includes(cat)) {
                    state.recommendedCategories.push(cat);
                }
            });
        }
        renderQuizQuestion(index + 1);
    };

    function applyQuizRecommendations() {
        state.recommendedCategories.forEach(catId => {
            state.selectedServices[catId + '-selected'] = true;
            const cat = SERVICES_DB.find(c => c.category === catId);
            if (cat) cat.services.forEach(s => { state.selectedServices[s.id] = false; });
        });
        render();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('q-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Enviando... <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>';
        submitBtn.disabled = true;
        if (window.lucide) window.lucide.createIcons();

        const totals = calculateTotals();
        const selectedList = Object.entries(state.selectedServices)
            .filter(([k, v]) => v && !k.endsWith('-selected'))
            .map(([k]) => getServiceById(k))
            .filter(Boolean);

        const formData = new FormData();
        formData.append('formType', 'quote_calculator_v2');
        formData.append('requester', document.getElementById('q-name').value);
        formData.append('company', document.getElementById('q-company').value || 'N/A');
        formData.append('contactMethod', 'email');
        formData.append('contactValue', document.getElementById('q-email').value);
        formData.append('phone', document.getElementById('q-phone').value);
        formData.append('comments', document.getElementById('q-comments').value || '');
        formData.append('services', JSON.stringify(selectedList.map(s => s.name)));
        formData.append('totalOneTime', totals.oneTime);
        formData.append('totalMonthly', totals.monthly);
        formData.append('totalSavings', totals.savings);
        formData.append('quizAnswers', JSON.stringify(state.quizAnswers));
        formData.append('message', `
**Cotización Automática**
Servicios: ${selectedList.map(s => s.name).join(', ')}
Pago único: $${totals.oneTime} USD
Mensual: $${totals.monthly} USD/mes
Ahorro estimado: $${totals.savings} USD
Teléfono: ${document.getElementById('q-phone').value}
Comentarios: ${document.getElementById('q-comments').value || 'Ninguno'}
        `);

        try {
            const response = await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
            if (response.ok) {
                container_showSuccess(totals, selectedList);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            alert('Error al enviar. Intenta de nuevo o contáctanos por WhatsApp.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    function container_showSuccess(totals, selectedList) {
        const container = document.getElementById('calculator-app');
        const phone = document.getElementById('q-phone')?.value || '';
        const waText = `Hola! Acabo de cotizar en su web. Servicios: ${selectedList.map(s => s.name).join(', ')}. Total estimado: $${totals.oneTime} USD + $${totals.monthly}/mes.`;
        const waUrl = window.buildWhatsAppUrl
            ? window.buildWhatsAppUrl('+57', waText)
            : `https://wa.me/573122908416?text=${encodeURIComponent(waText)}`;

        container.innerHTML = `
        <div class="text-center max-w-lg mx-auto py-12 animate-fade-in">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: rgba(34, 197, 94, 0.15);">
                <i data-lucide="check-circle" class="w-10 h-10 text-green-400"></i>
            </div>
            <h2 class="text-3xl font-black mb-3">¡Cotización Enviada!</h2>
            <p class="text-cd-text-dim mb-8">Hemos recibido tu solicitud. Nuestro equipo te contactará en menos de 2 horas con una propuesta detallada.</p>
            <div class="card-modern p-4 mb-8 text-left">
                <div class="flex justify-between mb-2">
                    <span class="text-sm text-cd-text-dim">Inversión única</span>
                    <span class="font-bold">$${totals.oneTime.toLocaleString()} USD</span>
                </div>
                ${totals.monthly > 0 ? `
                    <div class="flex justify-between">
                        <span class="text-sm text-cd-text-dim">Mensual</span>
                        <span class="font-bold">$${totals.monthly.toLocaleString()} USD/mes</span>
                    </div>
                ` : ''}
            </div>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="${waUrl}" target="_blank" class="btn-primary justify-center py-3 px-6">
                    <i data-lucide="message-circle" class="w-4 h-4"></i> Hablar por WhatsApp
                </a>
                <a href="/" class="btn-secondary justify-center py-3 px-6">
                    Volver al inicio
                </a>
            </div>
        </div>`;

        if (window.lucide) window.lucide.createIcons();
    }

    // ==========================================
    // INIT
    // ==========================================
    window.initCalculator = function () {
        // Check hash for pre-selected category
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const cat = SERVICES_DB.find(c => c.category === hash);
            if (cat) {
                state.selectedServices[hash + '-selected'] = true;
                cat.services.forEach(s => { state.selectedServices[s.id] = false; });
            }
        }
        render();
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('calculator-app')) window.initCalculator();
        });
    } else {
        if (document.getElementById('calculator-app')) window.initCalculator();
    }
})();

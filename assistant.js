(function () {
  'use strict';

  function initializeAssistant() {
    const elements = {
      toggle: document.getElementById('assistant-toggle'),
      dialog: document.getElementById('diesel-assistant'),
      title: document.getElementById('assistant-title'),
      close: document.getElementById('assistant-close'),
      body: document.getElementById('assistant-body'),
      description: document.getElementById('assistant-description'),
      log: document.getElementById('assistant-log'),
      options: document.getElementById('assistant-options'),
      form: document.getElementById('assistant-form'),
      service: document.getElementById('assistant-service'),
      vehicle: document.getElementById('assistant-vehicle'),
      message: document.getElementById('assistant-message'),
      formBack: document.getElementById('assistant-form-back'),
      result: document.getElementById('assistant-result'),
      preview: document.getElementById('assistant-preview'),
      send: document.getElementById('assistant-send'),
      edit: document.getElementById('assistant-edit'),
      resultBack: document.getElementById('assistant-result-back'),
      home: document.getElementById('assistant-home')
    };
    const fallback = document.getElementById('assistant-fallback');

    if (Object.values(elements).some(function (element) { return !element; }) ||
        typeof elements.dialog.showModal !== 'function' ||
        typeof elements.dialog.close !== 'function') {
      return;
    }

    const services = [
      'Bombas e inyectores',
      'Sistema common rail',
      'Diagnóstico por escáner',
      'Otra consulta'
    ];
    const whatsappBase = 'https://wa.me/5493518036358';
    const mapUrl = 'https://maps.app.goo.gl/M78CHre8Fu8QemkX9';
    const messageLimit = 30;

    function whatsappUrl(message) {
      return whatsappBase + '?text=' + encodeURIComponent(message);
    }

    function scrollToLatest() {
      elements.body.scrollTop = elements.body.scrollHeight;
    }

    function focusElement(element) {
      if (elements.dialog.open) element.focus({ preventScroll: true });
    }

    function appendMessage(message, speaker) {
      const bubble = document.createElement('p');
      bubble.className = 'assistant-message assistant-message-' + speaker;
      bubble.textContent = message;
      elements.log.append(bubble);
      while (elements.log.childElementCount > messageLimit) {
        elements.log.firstElementChild.remove();
      }
      scrollToLatest();
      return bubble;
    }

    function renderChoices(choices, moveFocus) {
      const fragment = document.createDocumentFragment();
      choices.forEach(function (choice) {
        const control = document.createElement(choice.href ? 'a' : 'button');
        control.className = 'assistant-choice' + (choice.primary ? ' assistant-choice-primary' : '');
        control.textContent = choice.label;
        control.setAttribute('aria-label', choice.label);
        if (choice.href) {
          control.href = choice.href;
          control.target = '_blank';
          control.rel = 'noopener noreferrer';
        } else {
          control.type = 'button';
          control.dataset.assistantAction = choice.action;
          if (choice.service) control.dataset.assistantService = choice.service;
        }
        fragment.append(control);
      });
      elements.options.replaceChildren(fragment);
      elements.options.hidden = false;
      elements.form.hidden = true;
      elements.result.hidden = true;
      scrollToLatest();
      if (moveFocus !== false) focusElement(elements.options.firstElementChild || elements.title);
    }

    function menuChoices() {
      return [
        { label: 'Servicios', action: 'services' },
        { label: 'Ubicación', action: 'location' },
        { label: 'Horarios y turnos', action: 'schedule' },
        { label: 'Precios', action: 'prices' },
        { label: 'Preparar consulta', action: 'prepare', primary: true }
      ];
    }

    function showMenu(moveFocus) {
      renderChoices(menuChoices(), moveFocus);
    }

    function showForm(service) {
      if (service && services.indexOf(service) !== -1) elements.service.value = service;
      elements.options.hidden = true;
      elements.result.hidden = true;
      elements.form.hidden = false;
      elements.form.scrollIntoView({ block: 'start', behavior: 'instant' });
      focusElement(elements.service);
    }

    function returnToMenu(label) {
      appendMessage(label, 'user');
      appendMessage('Elegí otra opción. Tu consulta se conserva mientras esta página siga abierta.', 'bot');
      showMenu();
    }

    function handleChoice(action, service) {
      if (action === 'services') {
        appendMessage('Servicios disponibles: reparación de bombas inyectoras e inyectores, sistema common rail y diagnóstico por escáner. Para orientarte, contanos la marca, el modelo y el año del vehículo, qué ocurre y desde cuándo.', 'bot');
        renderChoices([
          { label: 'Consultar por bombas e inyectores', action: 'prepare', service: services[0] },
          { label: 'Consultar por common rail', action: 'prepare', service: services[1] },
          { label: 'Consultar por diagnóstico por escáner', action: 'prepare', service: services[2] },
          { label: 'Volver al menú', action: 'menu' }
        ]);
      } else if (action === 'location') {
        const locationMessage = appendMessage('Estamos en Av. Armada Argentina 1713, Córdoba Capital.', 'bot');
        const mapLink = document.createElement('a');
        mapLink.className = 'assistant-inline-link';
        mapLink.href = mapUrl;
        mapLink.target = '_blank';
        mapLink.rel = 'noopener noreferrer';
        mapLink.textContent = 'Ver dirección en Google Maps ↗';
        locationMessage.append(mapLink);
        renderChoices([
          { label: 'Preparar consulta', action: 'prepare', primary: true },
          { label: 'Volver al menú', action: 'menu' }
        ]);
      } else if (action === 'schedule') {
        appendMessage('Atendemos de lunes a viernes, de 9 a 13 y de 15 a 17:30. Para coordinar un turno, consultá disponibilidad con el taller por WhatsApp.', 'bot');
        renderChoices([
          {
            label: 'Consultar disponibilidad de turno',
            href: whatsappUrl('Hola Diesel Sur, quisiera consultar disponibilidad y coordinar un turno.'),
            primary: true
          },
          { label: 'Preparar consulta', action: 'prepare' },
          { label: 'Volver al menú', action: 'menu' }
        ]);
      } else if (action === 'prices') {
        appendMessage('El importe del presupuesto depende del trabajo y de la evaluación del caso. Compartí el vehículo, el año y el motivo de tu consulta para que el taller pueda orientarte.', 'bot');
        renderChoices([
          {
            label: 'Consultar precios por WhatsApp',
            href: whatsappUrl('Hola Diesel Sur, quisiera consultar el precio o presupuesto de un servicio.'),
            primary: true
          },
          { label: 'Preparar consulta con mis datos', action: 'prepare' },
          { label: 'Volver al menú', action: 'menu' }
        ]);
      } else if (action === 'prepare') {
        appendMessage('Contanos qué vehículo tenés, el año, qué ocurre y desde cuándo. Si lo sabés, incluí el motor y cualquier código de falla. Después podés revisar el mensaje y continuar por WhatsApp.', 'bot');
        showForm(service);
      } else if (action === 'menu') {
        appendMessage('Elegí una opción para continuar.', 'bot');
        showMenu();
      }
    }

    elements.options.addEventListener('click', function (event) {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('button[data-assistant-action]');
      if (!control || !elements.options.contains(control)) return;
      appendMessage(control.textContent, 'user');
      handleChoice(control.dataset.assistantAction, control.dataset.assistantService);
    });

    elements.toggle.addEventListener('click', function () {
      if (elements.dialog.open) return;
      try {
        elements.dialog.showModal();
        document.documentElement.classList.add('assistant-is-open');
        elements.toggle.setAttribute('aria-expanded', 'true');
        focusElement(elements.title);
      } catch (error) {
        document.documentElement.classList.remove('assistant-is-open');
        elements.toggle.setAttribute('aria-expanded', 'false');
        elements.toggle.hidden = true;
        if (fallback) {
          fallback.hidden = false;
          fallback.focus();
        }
      }
    });

    elements.close.addEventListener('click', function () {
      elements.dialog.close();
    });

    elements.dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('assistant-is-open');
      elements.toggle.setAttribute('aria-expanded', 'false');
      if (!elements.toggle.hidden) elements.toggle.focus({ preventScroll: true });
    });

    elements.message.addEventListener('input', function () {
      elements.message.setCustomValidity('');
    });

    elements.form.addEventListener('submit', function (event) {
      event.preventDefault();
      const message = elements.message.value.trim();
      elements.message.setCustomValidity(message ? '' : 'Escribí brevemente tu consulta.');
      if (!elements.form.reportValidity()) return;

      const selectedService = elements.service.value;
      const service = services.indexOf(selectedService) === -1 ? 'Otra consulta' : selectedService;
      const vehicle = elements.vehicle.value.trim();
      const summary = [
        'Hola Diesel Sur, quiero hacer una consulta.',
        'Servicio: ' + service,
        vehicle ? 'Vehículo: ' + vehicle : '',
        'Consulta: ' + message
      ].filter(Boolean).join('\n');

      elements.preview.textContent = summary;
      elements.send.href = whatsappUrl(summary);
      appendMessage('Preparar mensaje', 'user');
      appendMessage('Tu mensaje está preparado. Revisalo abajo y abrí WhatsApp cuando quieras continuar. Desde WhatsApp podés revisarlo y enviarlo.', 'bot');
      elements.options.hidden = true;
      elements.form.hidden = true;
      elements.result.hidden = false;
      const resultTitle = elements.result.querySelector('h3');
      resultTitle.tabIndex = -1;
      elements.result.scrollIntoView({ block: 'start', behavior: 'instant' });
      focusElement(resultTitle);
    });

    elements.edit.addEventListener('click', function () {
      appendMessage('Editar consulta', 'user');
      showForm();
    });

    elements.formBack.addEventListener('click', function () { returnToMenu('Volver al menú'); });
    elements.resultBack.addEventListener('click', function () { returnToMenu('Volver al menú'); });
    elements.home.addEventListener('click', function () { returnToMenu('Otras opciones'); });

    appendMessage('Hola, soy el asistente de Diesel Sur. Puedo mostrarte información del taller y ayudarte a preparar una consulta por WhatsApp. Elegí una opción.', 'bot');
    showMenu(false);
    elements.toggle.hidden = false;
    if (fallback) fallback.hidden = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAssistant, { once: true });
  } else {
    initializeAssistant();
  }
}());

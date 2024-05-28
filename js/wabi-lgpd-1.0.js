/** wabiLGPD 1.0
*
* Copyright 2024, Rudi Drusian - https://rudi.drusian.com.br
* Licensed under MIT - https://telazul.drusian.com.br/pt/artigo/licenca
*
*/

// ########################
// #   Funções Externas   #
// ########################

// ##################
// #   setCookie()  #
// ##################
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/; SameSite=None; Secure";
}

// ##################
// #   getCookie()  #
// ##################
function getCookie(name) {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		 let c = ca[i];
		 while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		 if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

// ####################
// #   eraseCookie()  #
// ####################
function eraseCookie(name) {
	document.cookie = name + '=; Max-Age=-99999999;';
}

// ####################
// #   validateURL()  #
// ####################
function validateURL(str) {
	let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	 '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	 '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	 '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	 '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	 '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return !!pattern.test(str);
}

// #########################
// #  Current Script Path  #
// #########################
const wabiSrc = document.currentScript.src;
const wabiPath = wabiSrc.substring(0, wabiSrc.lastIndexOf("/"));;

// ############################################
// #  Lei Geral de Proteção de Dados (LGPD)   #
// ############################################
const wabiLGPD = function(options) {
	const t = this;
	// Options
	t.opt = Object.assign({}, wabiLGPD.Defaults, options);

	// Button Open Dialog
	t.showDialogButton = document.querySelectorAll('.wabi-lgpd-show-dialog');

	// Text for Accordion items and help
	t.onOffText = [
		{ id: 'strictlyNecessary' },
		{ id: 'performanceCookies' },
		{ id: 'functionalCookies' },
		{ id: 'targetingCookies' },
	];

	// Allowed Languages
	t.allowedLanguages = ['pt','en','es'];

	// strictlyNecessary always true
	setCookie(t.opt.name + 'strictlyNecessary', true, t.opt.expire);

	// First Access
	if (!getCookie(t.opt.name)) {
		// Set Show Dialog Cookie
		setCookie('wabiShowDialog', true, t.opt.expire);
	}

	// Until the user take action
	if (getCookie('wabiShowDialog') == 'true') {
		// Set Initial Consent Cookie
		setCookie(t.opt.name, t.opt.initialConsent, t.opt.expire);
		// Cookie by Type
		if (t.onOffText) {
			for (let i = 0; i < t.onOffText.length; i++) {
				let s = t.onOffText[i];
				if (s.id != 'strictlyNecessary') {
					setCookie(t.opt.name + s.id, t.opt.initialConsent, t.opt.expire);
				}
			}
		}
	}

	// Validate privacy policy url
	if (validateURL(t.opt.privacyPolicyUrl) === false) {
		throw new Error('LGPD Cookies: Error loading privacy policy url');
	// Validate language
	} else if (!t.allowedLanguages.includes(t.opt.lang)) {
		throw new Error('LGPD Language: Error loading translations' );
	} else if (t.opt.analytics === true && (typeof t.opt.analyticsID == 'undefined' || t.opt.analyticsID == '')) {
		throw new Error('LGPD Analytics: Configure a valid ID' );
	} else if (t.opt.adsense === true && (typeof t.opt.adsenseID == 'undefined' || t.opt.adsenseID == '')) {
		throw new Error('LGPD Adsense: Configure a valid ID' );
	} else {
		t.init();
	}
}

// #############
// #  Options  #
// #############
wabiLGPD.Defaults = {
	name: 'wabiConsentLGPD',
	initialConsent: false,
	expire: 365,
	lang: 'pt',
	showDecline: true,
	showSettings: true,
	analytics: false,
	adsense: false
}

// #################
// #   Analytics   #
// #################
wabiLGPD.prototype.loadAnalytics = function (e) {
	const t = this;
	t.analytics = document.createElement('script');
	t.analytics.async = true;
	t.analytics.src = 'https://www.googletagmanager.com/gtag/js?id=' + t.opt.analyticsID;
	document.head.appendChild(t.analytics);
	t.analytics.onload = function() {
		window.dataLayer = window.dataLayer || [];
	   function gtag(){dataLayer.push(arguments);}
	   gtag('js', new Date());
	   gtag('config', t.opt.analyticsID);
	};
}

// ###############
// #   Adsense   #
// ###############
wabiLGPD.prototype.loadAdsense = function (e) {
	const t = this;
	t.adsense = document.createElement('script');
	t.adsense.async = true;
	t.adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + t.opt.adsenseID;
	t.adsense.crossorigin = 'anonymous';
	document.head.appendChild(t.adsense);
	t.adsense.onload = function() {
		t.adsenseManualAds = document.querySelectorAll('ins.adsbygoogle:not([class*=" "])');
		for (let i = 0; i < t.adsenseManualAds.length; i++) {
			 try {
				 (adsbygoogle = window.adsbygoogle || []).push({});
			 } catch (error) { }
		}
	}
}

// #################
// #   consent()   #
// #################
wabiLGPD.prototype.consent = function (e) {
	const t = this;
	// Consent
	setCookie(t.opt.name, true, t.opt.expire);
	// Cookies by Type
	if (t.onOffItems) {
		for (let i = 0; i < t.onOffItems.length; i++) {
			let s = t.onOffItems[i];
			setCookie(t.opt.name + s.id, true, t.opt.expire);
			s.checked = true;
		}
	}
	// Close
	t.closeSettings(e);
	t.closeDialog();
	// Analytics
	if (t.opt.analytics && typeof t.analytics == 'undefined') t.loadAnalytics();
	// Adsense
	if (t.opt.adsense && typeof t.adsense == 'undefined') t.loadAdsense();
}

// ########################
// #   confirmChoices()   #
// ########################
wabiLGPD.prototype.confirmChoices = function (e) {
	const t = this;
	// Consent all
	let consent = true;
	// Set cookies by type
	for (let i = 0; i < t.onOffItems.length; i++) {
		let s = t.onOffItems[i];
		setCookie(t.opt.name + s.id, s.checked, t.opt.expire);
		// Consent all is false if one of the cookie types is false
		if (s.checked === false) { consent = false; }

		if (s.checked == true) {
			// Performance Cookies: Analytics
			if (s.id == 'performanceCookies' && t.opt.analytics && typeof t.analytics == 'undefined') {
				t.loadAnalytics();
			}
			// Targeting Cookies: ADsense
			if (s.id == 'targetingCookies' && t.opt.adsense && typeof t.adsense == 'undefined') {
				t.loadAdsense();
			}
		}
	}
	// Set Consent for All Cookies
	setCookie(t.opt.name, consent, t.opt.expire);
	// Tell not to open the dialog
	setCookie('wabiShowDialog', false, t.opt.expire);
	// Close
	t.closeSettings(e);
	t.closeDialog();
}

// #################
// #   decline()   #
// #################
wabiLGPD.prototype.decline = function (e) {
	const t = this;
	setCookie(t.opt.name, false, t.opt.expire);
	for (let i = 0; i < t.onOffItems.length; i++) {
		let s = t.onOffItems[i];
		if (s.id != 'strictlyNecessary') {
			setCookie(t.opt.name + s.id, false, t.opt.expire);
			s.checked = false;
		}
	}
	t.closeDialog();
}

// ##################
// #   settings()   #
// ##################
wabiLGPD.prototype.settings = function (e) {
	const t = this;
	t.dialog.classList.remove('active');
	t.settingsDialog.classList.add('active');
}

// #######################
// #   closeSettings()   #
// #######################
wabiLGPD.prototype.closeSettings = function (e) {
	const t = this;
	e.preventDefault();
	t.dialog.classList.add('active');
	if (t.opt.showSettings) {
		t.settingsDialog.classList.remove('active');
	}
}

// #########################
// #   toogleAccordion()   #
// #########################
wabiLGPD.prototype.toogleAccordion = function (s,e) {
	if (e.target.classList.contains('wabiLGPD-settings-text')) {
		s.nextElementSibling.classList.toggle('active');
	}
}

// ####################
// #   logCookies()   #
// ####################
wabiLGPD.prototype.logCookies = function (e) {
	const t = this;
	console.log('Consent All: ' + getCookie(t.opt.name));
	console.log('Show Dialog: ' + getCookie("wabiShowDialog"));
	if (t.onOffText) {
		for (let i = 0; i < t.onOffText.length; i++) {
			let s = t.onOffText[i];
			console.log(s.id + ': ' + getCookie(t.opt.name + s.id));
		}
	}
}

// ###################
// #   newDialog()   #
// ###################
wabiLGPD.prototype.newDialog = function (e) {
	const t = this;

	// Cria o container
	t.container = document.createElement('div');
	t.container.className = 'wabiLGPD-container active';
	document.body.appendChild(t.container);

	// Cria a caixa de dialogo
	t.dialog = document.createElement('div');
	t.dialog.className = 'wabiLGPD-dialog active';
	t.container.appendChild(t.dialog);

	// Cria o container da mensagem
	t.dialogMessageContainer = document.createElement('div');
	t.dialogMessageContainer.className = 'wabiLGPD-message';
	t.dialog.appendChild(t.dialogMessageContainer);

	// Cria o título da mensagem
	t.dialogTitle = document.createElement('h1');
	t.dialogTitle.innerHTML = t.lang.dialogTitle;
	t.dialogMessageContainer.appendChild(t.dialogTitle);

	// Cria a mensagem
	t.dialogMessage = document.createElement('p');
	t.dialogMessage.innerHTML = t.lang.message[langModifier] + ' ';
	t.dialogMessageContainer.appendChild(t.dialogMessage);

	// Política de Privacidade
	t.privacyPolicyP = document.createElement('p');
	t.privacyPolicyP.className = 'text-center';
	t.dialogMessageContainer.appendChild(t.privacyPolicyP);

	t.privacyPolicyUrl = document.createElement('a');
	t.privacyPolicyUrl.href = t.opt.privacyPolicyUrl;
	t.privacyPolicyUrl.innerHTML = t.lang.learnMore;
	t.privacyPolicyP.appendChild(t.privacyPolicyUrl);

	// Cria o container dos botões
	t.dialogButtons = document.createElement('div');
	t.dialogButtons.className = 'wabiLGPD-buttons';
	t.dialog.appendChild(t.dialogButtons);

	// Botão Consentir
	t.consentButton = document.createElement('button');
	t.consentButton.className = 'wabiLGPD-btn wabiLGPD-btn-consent';
	t.consentButton.innerHTML = t.lang.consent[langModifier];
	t.dialogButtons.appendChild(t.consentButton);

	if (t.opt.showDecline) {
		// Botão Recusar
		t.declineButton = document.createElement('button');
		t.declineButton.className = 'wabiLGPD-btn wabiLGPD-btn-decline';
		t.declineButton.innerHTML = t.lang.decline;
		t.dialogButtons.appendChild(t.declineButton);
	}

	// Botão Configurar
	if (t.opt.showSettings) {
		t.settingsButton = document.createElement('button');
		t.settingsButton.className = 'wabiLGPD-btn wabiLGPD-btn-settings';
		t.settingsButton.innerHTML = t.lang.settings;
		t.dialogButtons.appendChild(t.settingsButton);
	}
}

// ####################
// #   showDialog()   #
// ####################
wabiLGPD.prototype.showDialog = function (e) {
	const t = this;
	e.preventDefault();
	t.container.classList.add('active');
}

// #####################
// #   closeDialog()   #
// #####################
wabiLGPD.prototype.closeDialog = function (e) {
	const t = this;
	t.container.classList.remove('active')
	setCookie('wabiShowDialog', false, t.opt.expire);
}

// ###########################
// #   newSettingsDialog()   #
// ###########################
wabiLGPD.prototype.newSettingsDialog = function (e) {
	const t = this;

	// Configuration container
	t.settingsDialog = document.createElement('div');
	t.settingsDialog.className = 'wabiLGPD-settings';
	t.container.appendChild(t.settingsDialog);

	// Title
	t.settingsDialogTitle = document.createElement('h1');
	t.settingsDialogTitle.innerHTML = t.lang.settingsDialogTitle;
	t.settingsDialog.appendChild(t.settingsDialogTitle);

	// Close Button
	t.settingsCloseButton = document.createElement('a');
	t.settingsCloseButton.href = '';
	t.settingsCloseButton.className = 'wabiLGPD-close-btn';
	t.settingsCloseButton.innerHTML = '&#x02a2f;';
	t.settingsDialog.appendChild(t.settingsCloseButton);

	// Message
	t.settingsDialogMessage = document.createElement('p');
	t.settingsDialogMessage.innerHTML = t.lang.settingsDialogMessage;
	t.settingsDialog.appendChild(t.settingsDialogMessage);

	// Accordion Help Container
	t.settingsDialogAccordion = document.createElement('div');
	t.settingsDialogAccordion.className = 'wabiLGPD-accordion';
	t.settingsDialog.appendChild(t.settingsDialogAccordion);

	// Array to store items for later access
	t.accordionItems = [];
	t.onOffItems = [];

	// Create the Accordion Items
	for (let i = 0; i < t.onOffText.length; i++) {

		// Item container
		let item = document.createElement('div');
		item.className = 'wabiLGPD-accordion-item';
		t.settingsDialogAccordion.appendChild(item);

		// Item Header
		let itemHeader = document.createElement('div');
		itemHeader.className = 'wabiLGPD-accordion-item-header';
		item.appendChild(itemHeader);

		// Cookie Type
		let text = document.createElement('div');
		text.className = 'wabiLGPD-settings-text';
		text.innerHTML = t.onOffText[i].lang + ' &#8595;';
		itemHeader.appendChild(text);

		// On / Off
		let onOff = document.createElement('div');
		onOff.className = 'wabiLGPD-on-off';
		itemHeader.appendChild(onOff);

		let onOffLabel = document.createElement('label');
		onOff.appendChild(onOffLabel);

		// Checkbox
		let cookie = getCookie(t.opt.name + t.onOffText[i].id);
		let onOffCheckbox = document.createElement('input');
		onOffCheckbox.type = 'checkbox';
		onOffCheckbox.id = t.onOffText[i].id;
		// strictlyNecessary always TRUE, disabled
		if (t.onOffText[i].id == 'strictlyNecessary') {
			onOffCheckbox.checked = true;
			onOffCheckbox.disabled = true;
		} else if (cookie == 'true' || (cookie === null && t.opt.initialConsent === true)) {
			onOffCheckbox.checked = true;
		}
		onOffLabel.appendChild(onOffCheckbox);

		let onOffSpan = document.createElement('span');
		onOffLabel.appendChild(onOffSpan);

		// Accordion Help
		let body = document.createElement('div');
		body.className = 'wabiLGPD-accordion-body';
		item.appendChild(body);

		let bodyText = document.createElement('div');
		bodyText.innerHTML = t.onOffText[i].langHelp;
		body.appendChild(bodyText);

		//  Save items for latter access

		// Accordion
		t.accordionItems[i] = itemHeader;
		// On / Off
		t.onOffItems[i] = onOffCheckbox;

	}

	// Buttons
	t.settingsDialogButtons = document.createElement('div');
	t.settingsDialogButtons.className = 'wabiLGPD-buttons';
	t.settingsDialog.appendChild(t.settingsDialogButtons);

	// Confirm Choices Button
	t.settingsConfirmButton = document.createElement('button');
	t.settingsConfirmButton.className = 'wabiLGPD-btn wabiLGPD-btn-confirm';
	t.settingsConfirmButton.innerHTML = t.lang.confirm;
	t.settingsDialogButtons.appendChild(t.settingsConfirmButton);

	// Consent All Button
	t.settingsConsentButton = document.createElement('button');
	t.settingsConsentButton.className = 'wabiLGPD-btn wabiLGPD-btn-consent';
	t.settingsConsentButton.innerHTML = t.lang.consent[langModifier];
	t.settingsDialogButtons.appendChild(t.settingsConsentButton);

}

// ###################
// #   Lang / Init   #
// ###################
wabiLGPD.prototype.init = function () {
	const t = this;

	fetch(wabiPath + `/wabi-lgpd-1.0.lang.json`)
	.then(response => response.json())
	.then(response => {
		// Lang
		t.lang = response[t.opt.lang];

		// Text for Accordion items and help
		for (var i = 0; i < t.onOffText.length; i++) {
			t.onOffText[i].lang = t.lang[t.onOffText[i].id];
			t.onOffText[i].langHelp = t.lang[t.onOffText[i].id + 'Help'];
		}

		// init 2
		t.init2();
	})
	.catch(error => {
      console.error(`LGPD: Error loading translations`);
    });
}

// ###########
// #  Init 2 #
// ###########
wabiLGPD.prototype.init2 = function (e) {
	const t = this;

	// Defines the message according to whether consent is required or not
	if (t.opt.initialConsent && !t.opt.showDecline && !t.opt.showSettings) {
		langModifier = 'mandatory';
	} else {
		langModifier = 'default';
	}

	// Create the dialog boxes
	t.newDialog();
	if (t.opt.showSettings) {
		t.newSettingsDialog();
	}

	// Analytics
	if (t.opt.analytics && getCookie(t.opt.name + 'performanceCookies') == 'true') t.loadAnalytics();

	// Adsense
	if (t.opt.adsense && getCookie(t.opt.name + 'targetingCookies') == 'true') t.loadAdsense();

	// #####################
	// #  Event Listeners  #
	// #####################

	// Show Dialog Button - Cookies
	if (t.showDialogButton) {
		t.showDialogButtonClickHandler = [];
		for (let i = 0; i < t.showDialogButton.length; i++) {
			t.showDialogButtonClickHandler[i] = t.showDialog.bind(t);
			t.showDialogButton[i].addEventListener('click', t.showDialogButtonClickHandler[i]);
		}
	}

	// Consent Button
	t.consentButtonClickHandler = t.consent.bind(t);
	t.consentButton.addEventListener('click', t.consentButtonClickHandler);

	// Decline Button
	if (t.opt.showDecline) {
		t.declineButtonClickHandler = t.decline.bind(t);
		t.declineButton.addEventListener('click', t.declineButtonClickHandler);
	}

	if (t.opt.showSettings) {
		// Settings Button
		t.settingsButtonClickHandler = t.settings.bind(t);
		t.settingsButton.addEventListener('click', t.settingsButtonClickHandler);

		// Settings Consent Button
		if (t.opt.showSettings) {
			t.settingsConsentButtonClickHandler = t.consent.bind(t);
			t.settingsConsentButton.addEventListener('click', t.settingsConsentButtonClickHandler);
		}

		// Settings Close Button
		t.settingsCloseButtonClickHandler = t.closeSettings.bind(t);
		t.settingsCloseButton.addEventListener('click', t.settingsCloseButtonClickHandler);

		// Settings Close Button
		t.settingsCloseButtonClickHandler = t.closeSettings.bind(t);
		t.settingsCloseButton.addEventListener('click', t.settingsCloseButtonClickHandler);

		// Accordion Help - Cookie configuration
		t.accordionHandler = [];
		for (let i = 0; i < t.accordionItems.length; i++) {
			let s = t.accordionItems[i];
			t.accordionHandler[i] = t.toogleAccordion.bind(t,s);
			s.addEventListener('click', t.accordionHandler[i]);
		}

		// Settings Confirm Choices
		t.settingsConfirmButtonClickHandler = t.confirmChoices.bind(t);
		t.settingsConfirmButton.addEventListener('click', t.settingsConfirmButtonClickHandler);
	}

	// #############
	// #  Cookies  #
	// #############

	// Não abre a caixa de dialogo se o usuário já decidiu
	if (getCookie("wabiShowDialog") == 'false') {
		t.closeDialog();
	}
}

// ############
// #   Exit   #
// ############
wabiLGPD.prototype.exit = function() {
	// Limpa o objeto preparando para uma nova inicilização com diferentes opções
	const t = this;
	// Remove the dialog and all the events associated
	t.container.parentNode.removeChild(t.container);
}

// ##############
// #   Reload   #
// ##############
wabiLGPD.prototype.reload = function() {
	const t = this;
	t.exit();
	t.init();
}

// ############
// #   Load   #
// ############
// myWabiLGPDObjects = new wabiLGPD({});

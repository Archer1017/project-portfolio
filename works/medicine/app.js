(function () {
	'use strict'


	const STORE_KEY = 'medicine_discerner_offline_restore_v1'
	const today = new Date()
	const state = {
		page: 'home',
		stream: null,
		currentMonth: new Date(today.getFullYear(), today.getMonth(), 1),
		settings: { narrator: true, sound: true, rate: 1 },
		medicines: [
			{ name: '布洛芬缓释胶囊', slot: '一号格', dosage: '展示用信息，请遵医嘱与药品说明书', start: '', expiry: '', note: '止痛退热' },
			{ name: '阿莫西林胶囊', slot: '二号格', dosage: '展示用信息，请遵医嘱与药品说明书', start: '', expiry: '', note: '青霉素过敏者禁用' },
			{ name: '玻璃酸钠滴眼液', slot: '三号格', dosage: '遵医嘱滴眼使用', start: '', expiry: '', note: '人工泪液' }
		],
		plans: {}
	}

	const $ = (id) => document.getElementById(id)
	const pages = Array.from(document.querySelectorAll('.page'))
	const navButtons = Array.from(document.querySelectorAll('.nav-btn'))
	const medicineNames = [
		'布洛芬缓释胶囊',
		'阿莫西林胶囊',
		'氯雷他定片',
		'二甲双胍片',
		'维生素C片',
		'左氧氟沙星滴眼液',
		'玻璃酸钠滴眼液',
		'妥布霉素地塞米松滴眼液',
		'对乙酰氨基酚片',
		'蒙脱石散',
		'奥美拉唑肠溶胶囊',
		'盐酸左氧氟沙星片',
		'罗红霉素胶囊',
		'头孢克肟胶囊',
		'红霉素眼膏',
		'普拉洛芬滴眼液'
	]

	function save() {
		localStorage.setItem(STORE_KEY, JSON.stringify({
			settings: state.settings,
			medicines: state.medicines,
			plans: state.plans
		}))
	}

	function load() {
		try {
			const data = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
			if (data.settings) state.settings = Object.assign(state.settings, data.settings)
			if (Array.isArray(data.medicines)) state.medicines = data.medicines
			if (data.plans) state.plans = data.plans
		} catch (e) {}
	}

	function setStatus(text, speakIt) {
		$('liveStatus').textContent = text
		if (speakIt !== false) speak(text)
	}

	function speak(text) {
		if (!state.settings.narrator || !('speechSynthesis' in window)) return
		const msg = String(text || '').trim()
		if (!msg) return
		window.speechSynthesis.cancel()
		const utterance = new SpeechSynthesisUtterance(msg)
		utterance.lang = 'zh-CN'
		utterance.rate = Number(state.settings.rate || 1)
		window.speechSynthesis.speak(utterance)
	}

	function sound() {
		if (!state.settings.sound) return
		try {
			const AudioContext = window.AudioContext || window.webkitAudioContext
			const ctx = new AudioContext()
			const osc = ctx.createOscillator()
			const gain = ctx.createGain()
			osc.type = 'square'
			osc.frequency.value = 640
			gain.gain.value = 0.05
			osc.connect(gain)
			gain.connect(ctx.destination)
			osc.start()
			setTimeout(() => {
				osc.stop()
				ctx.close()
			}, 70)
		} catch (e) {}
	}

	function pageLabel(page) {
		return {
			home: '首页',
			scanner: '扫描器',
			finder: '找药',
			cabinet: '药箱',
			calendar: '日历',
			assistant: '小助手',
			settings: '设置'
		}[page] || '页面'
	}

	function pageSummary(page) {
		if (page === 'home') return '首页。可以进入扫描器、找药、药箱、日历、小助手和设置。'
		if (page === 'scanner') return '扫描器。可以打开摄像头，拍照预览，选择识别到的药名，并保存到药箱。'
		if (page === 'finder') return '找药。输入药名后点找药，我会朗读它在药箱里的位置。'
		if (page === 'cabinet') return '药箱。可以添加药品，设置格子、用法用量、开始日期和过期日期。'
		if (page === 'calendar') return '日历。可以为每一天设置要吃什么药、服药时间、开始日期和过期日期。'
		if (page === 'assistant') return '小助手。可以输入打开药箱、打开日历、眼睛干涩怎么办等问题。'
		return '设置。可以调整旁白、按键声音和清空本地数据。'
	}

	function openPage(page) {
		state.page = page
		pages.forEach((el) => el.classList.toggle('active', el.id === page))
		navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.page === page))
		if (page !== 'scanner') stopCamera(false)
		if (page === 'cabinet') renderMedicines()
		if (page === 'calendar') renderCalendar()
		setStatus('已打开' + pageLabel(page) + '。' + pageSummary(page))
		const heading = document.querySelector('#' + page + ' h2, #' + page + ' .h1')
		if (heading) heading.setAttribute('tabindex', '-1')
		if (heading) heading.focus({ preventScroll: true })
	}

	function renderSelect() {
		$('scanMedicine').innerHTML = medicineNames.map((name) => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('')
	}

	function renderMedicines() {
		const list = $('medicineList')
		if (!state.medicines.length) {
			list.innerHTML = '<div class="panel" tabindex="0">药箱是空的。</div>'
			return
		}
		list.innerHTML = state.medicines.map((med, index) => {
			const text = [med.name, med.slot || '未设置格子', med.dosage || '未设置用法', med.expiry ? '过期日期 ' + med.expiry : '未设置过期日期'].join('，')
			return '<article class="med-item" tabindex="0" aria-label="' + escapeHtml(text) + '">' +
				'<div><div class="med-name">' + escapeHtml(med.name) + '</div>' +
				'<div class="med-meta">' + escapeHtml(med.slot || '未设置格子') + ' · ' + escapeHtml(med.dosage || '未设置用法用量') + '</div>' +
				'<div class="med-meta">' + escapeHtml(med.expiry ? '过期：' + med.expiry : '未设置过期日期') + '</div></div>' +
				'<div><button class="pill-btn" data-read-med="' + index + '" aria-label="朗读' + escapeHtml(med.name) + '">朗读</button>' +
				'<button class="pill-btn" data-delete-med="' + index + '" aria-label="删除' + escapeHtml(med.name) + '">删除</button></div>' +
				'</article>'
		}).join('')
	}

	function addMedicine(med) {
		const name = String(med.name || '').trim()
		if (!name) {
			setStatus('请先输入药名')
			return false
		}
		const item = {
			name,
			slot: String(med.slot || '').trim(),
			dosage: String(med.dosage || '').trim(),
			start: String(med.start || '').trim(),
			expiry: String(med.expiry || '').trim(),
			note: String(med.note || '').trim()
		}
		const idx = state.medicines.findIndex((old) => old.name === item.name)
		if (idx >= 0) state.medicines[idx] = item
		else state.medicines.push(item)
		save()
		renderMedicines()
		renderCalendar()
		setStatus('已保存' + item.name + '到药箱。' + medicineText(item))
		return true
	}

	function medicineText(med) {
		return med.name + '，' + (med.slot ? '在' + med.slot : '没有设置格子') + '，' + (med.dosage || '没有设置用法用量') + '。'
	}

	function findMedicine() {
		const q = $('findInput').value.trim()
		if (!q) {
			setStatus('请先输入要找的药名')
			return
		}
		const med = state.medicines.find((item) => item.name.indexOf(q) >= 0 || q.indexOf(item.name) >= 0)
		const text = med ? medicineText(med) : '没有找到' + q + '。请检查药箱里是否已经保存。'
		$('findResult').textContent = text
		setStatus(text)
	}

	function dateKey(date) {
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		return y + '-' + m + '-' + d
	}

	function renderCalendar() {
		const month = state.currentMonth
		const year = month.getFullYear()
		const monthIndex = month.getMonth()
		const first = new Date(year, monthIndex, 1)
		const total = new Date(year, monthIndex + 1, 0).getDate()
		$('monthTitle').textContent = year + '年' + (monthIndex + 1) + '月'
		const blanks = (first.getDay() + 6) % 7
		const cells = []
		for (let i = 0; i < blanks; i++) cells.push('<div class="day-cell" aria-hidden="true"></div>')
		for (let day = 1; day <= total; day++) {
			const key = dateKey(new Date(year, monthIndex, day))
			const plan = state.plans[key]
			const label = key + (plan ? '，计划，' + plan.medicine + '，时间' + (plan.time || '未设置') : '，没有计划')
			cells.push('<button class="day-cell" data-day="' + key + '" role="gridcell" aria-label="' + escapeHtml(label) + '">' +
				'<span class="day-num">' + day + '</span>' +
				'<span class="day-plan">' + escapeHtml(plan ? plan.medicine + ' ' + (plan.time || '') : '无计划') + '</span>' +
				'</button>')
		}
		$('calendarGrid').innerHTML = cells.join('')
	}

	function savePlan() {
		const key = $('planDate').value
		if (!key) {
			setStatus('请先选择日期')
			return
		}
		const medicine = $('planMedicine').value.trim()
		if (!medicine) {
			setStatus('请填写当天要吃什么药')
			return
		}
		state.plans[key] = {
			medicine,
			time: $('planTime').value,
			start: $('planStart').value,
			expiry: $('planExpiry').value
		}
		save()
		renderCalendar()
		setStatus('已保存' + key + '的计划。' + medicine + '，时间' + (state.plans[key].time || '未设置') + '。')
	}

	function deletePlan() {
		const key = $('planDate').value
		if (!key) {
			setStatus('请先选择日期')
			return
		}
		delete state.plans[key]
		save()
		renderCalendar()
		setStatus('已删除' + key + '的服药计划')
	}

	async function openCamera() {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			setStatus('当前浏览器不支持摄像头。可以继续使用药名选择和药箱功能。')
			return
		}
		try {
			state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
			$('camera').srcObject = state.stream
			await $('camera').play()
			$('snapshot').classList.add('hidden')
			$('camera').classList.remove('hidden')
			setStatus('摄像头已打开。请把药盒正面最大药名放到框中间。')
		} catch (e) {
			setStatus('无法打开摄像头，请允许相机权限，或直接选择药名。')
		}
	}

	function capture() {
		const video = $('camera')
		if (!video.videoWidth) {
			setStatus('还没有摄像头画面，请先打开摄像头')
			return
		}
		const canvas = $('snapshot')
		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		const ctx = canvas.getContext('2d')
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
		video.classList.add('hidden')
		canvas.classList.remove('hidden')
		setStatus('已拍照。纯离线恢复版不会联网识别，请选择画面中最大的药名。')
	}

	function stopCamera(report) {
		if (state.stream) {
			state.stream.getTracks().forEach((track) => track.stop())
			state.stream = null
		}
		$('camera').srcObject = null
		if (report !== false) setStatus('摄像头已关闭')
	}

	function confirmScan() {
		const name = $('scanMedicine').value
		const template = state.medicines.find((med) => med.name === name) || { name, slot: '', dosage: '按说明书或医嘱服用', start: '', expiry: '', note: '' }
		addMedicine(template)
		setStatus('识别结果，药名，' + name + '。已保存到药箱。')
	}

	function addBubble(text, fromUser) {
		const div = document.createElement('div')
		div.className = 'bubble' + (fromUser ? ' user' : '')
		div.tabIndex = 0
		div.textContent = text
		$('chatLog').appendChild(div)
		$('chatLog').scrollTop = $('chatLog').scrollHeight
	}

	function handleAssistant(text) {
		const input = String(text || '').trim()
		if (!input) {
			setStatus('请先输入内容')
			return
		}
		addBubble(input, true)
		let reply = ''
		if (/扫描|识别|拍照/.test(input)) {
			reply = '好的，打开扫描器。'
			openPage('scanner')
		} else if (/药箱|药盒/.test(input)) {
			reply = '好的，打开药箱。'
			openPage('cabinet')
		} else if (/找药|在哪里|哪/.test(input)) {
			reply = '好的，打开找药。输入药名后我会播报位置。'
			openPage('finder')
		} else if (/日历|计划|提醒/.test(input)) {
			reply = '好的，打开日历。可以设置每天要吃什么药。'
			openPage('calendar')
		} else if (/设置|旁白|声音|语速/.test(input)) {
			reply = '好的，打开设置。'
			openPage('settings')
		} else if (/眼睛干|干涩|疲劳/.test(input)) {
			reply = '眼睛干涩可以先休息眼睛、减少连续看屏幕、保持环境湿润。若疼痛、红肿、视力下降或持续不适，请及时就医。'
		} else if (/眼药水|滴眼液/.test(input)) {
			reply = '滴眼液不要混用。多种眼药水之间通常要间隔几分钟，具体按医生或说明书。开封后的保存和有效期要特别注意。'
		} else {
			reply = '我在。你可以说打开扫描器、打开药箱、找药、打开日历，或者问眼睛干涩怎么办。'
		}
		addBubble(reply, false)
		setStatus(reply)
	}

	function escapeHtml(text) {
		return String(text || '').replace(/[&<>"']/g, (ch) => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[ch]))
	}

	function bind() {
		document.addEventListener('click', (event) => {
			const target = event.target.closest('button')
			if (!target) return
			sound()
			const label = target.getAttribute('aria-label') || target.textContent.trim()
			if (label) setStatus(label, false)
		}, true)

		document.querySelectorAll('[data-page]').forEach((btn) => {
			btn.addEventListener('click', () => openPage(btn.dataset.page))
		})

		$('speakPageBtn').addEventListener('click', () => setStatus(pageSummary(state.page)))
		$('voiceBtn').addEventListener('click', () => {
			openPage('assistant')
			setStatus('语音助手已打开。离线版请用输入框告诉我你想做什么。')
		})

		$('openCameraBtn').addEventListener('click', openCamera)
		$('captureBtn').addEventListener('click', capture)
		$('stopCameraBtn').addEventListener('click', () => stopCamera(true))
		$('guideBtn').addEventListener('click', () => setStatus('请把药盒正面朝向摄像头，让最大药名处于画面中间。太近会糊，太远会小，请慢慢移动。'))
		$('confirmScanBtn').addEventListener('click', confirmScan)

		$('findBtn').addEventListener('click', findMedicine)
		$('findInput').addEventListener('keydown', (event) => {
			if (event.key === 'Enter') findMedicine()
		})

		$('addMedBtn').addEventListener('click', () => {
			addMedicine({
				name: $('medName').value,
				slot: $('medSlot').value,
				dosage: $('medDosage').value,
				start: $('medStart').value,
				expiry: $('medExpiry').value,
				note: $('medNote').value
			})
		})
		$('fillDemoBtn').addEventListener('click', () => {
			$('medName').value = '玻璃酸钠滴眼液'
			$('medSlot').value = '三号格'
			$('medDosage').value = '遵医嘱或说明书滴眼使用'
			$('medStart').value = dateKey(today)
			$('medExpiry').value = ''
			$('medNote').value = '眼睛干涩时使用'
			setStatus('已填入示例，玻璃酸钠滴眼液')
		})
		$('medicineList').addEventListener('click', (event) => {
			const readBtn = event.target.closest('[data-read-med]')
			const deleteBtn = event.target.closest('[data-delete-med]')
			if (readBtn) {
				const med = state.medicines[Number(readBtn.dataset.readMed)]
				if (med) setStatus(medicineText(med))
			}
			if (deleteBtn) {
				const index = Number(deleteBtn.dataset.deleteMed)
				const med = state.medicines[index]
				if (med) {
					state.medicines.splice(index, 1)
					save()
					renderMedicines()
					setStatus('已删除' + med.name)
				}
			}
		})

		$('prevMonthBtn').addEventListener('click', () => {
			state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1)
			renderCalendar()
			setStatus($('monthTitle').textContent)
		})
		$('nextMonthBtn').addEventListener('click', () => {
			state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1)
			renderCalendar()
			setStatus($('monthTitle').textContent)
		})
		$('calendarGrid').addEventListener('click', (event) => {
			const btn = event.target.closest('[data-day]')
			if (!btn) return
			const key = btn.dataset.day
			const plan = state.plans[key] || {}
			$('planDate').value = key
			$('planMedicine').value = plan.medicine || ''
			$('planTime').value = plan.time || ''
			$('planStart').value = plan.start || key
			$('planExpiry').value = plan.expiry || ''
			setStatus(key + (plan.medicine ? '，已有计划，' + plan.medicine : '，没有计划，可以添加'))
		})
		$('savePlanBtn').addEventListener('click', savePlan)
		$('deletePlanBtn').addEventListener('click', deletePlan)

		$('sendChatBtn').addEventListener('click', () => {
			handleAssistant($('chatInput').value)
			$('chatInput').value = ''
		})
		$('chatInput').addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				handleAssistant($('chatInput').value)
				$('chatInput').value = ''
			}
		})

		$('rateRange').addEventListener('input', () => {
			state.settings.rate = Number($('rateRange').value)
			save()
			setStatus('旁白语速已调整为' + state.settings.rate)
		})
		$('toggleNarratorBtn').addEventListener('click', () => {
			state.settings.narrator = !state.settings.narrator
			save()
			setStatus(state.settings.narrator ? '旁白已开启' : '旁白已关闭', true)
		})
		$('toggleSoundBtn').addEventListener('click', () => {
			state.settings.sound = !state.settings.sound
			save()
			setStatus(state.settings.sound ? '按键音已开启' : '按键音已关闭')
		})
		$('resetDataBtn').addEventListener('click', () => {
			state.medicines = []
			state.plans = {}
			save()
			renderMedicines()
			renderCalendar()
			setStatus('本地数据已清空')
		})
	}

	function init() {
		load()
		renderSelect()
		renderMedicines()
		renderCalendar()
		$('rateRange').value = state.settings.rate
		addBubble('你好，我是离线小助手。你可以让我打开扫描器、药箱、日历，也可以问眼睛干涩怎么办。', false)
		bind()
		setTimeout(() => setStatus('药品分辨器离线恢复版已启动。当前在首页。'), 300)
	}

	init()
})()

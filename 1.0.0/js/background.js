$(document).ready(loadProxy);

$(document).on('click', '#addProxyBtn', addProxy);
$(document).on('click', '#setProxyBtn', function(){
	var profileId = $(this).data('profileid');
	setProxy(profileId);
	chrome.storage.local.set({'lastProfileId':profileId}, function(){
		loadProxy();
	});
});
$(document).on('click', '#addProxy #submitBtn', function(){
	var profileId = $(this).data('profileid');
	var profileName = $('#txtProfileName').prop('value');
	var proxyScheme = $('#txtProxyScheme').prop('value');
	var proxyHost = $('#txtProxyHost').prop('value');
	var proxyPort = $('#txtProxyPort').prop('value');
	var proxyUsername = $('#txtProxyUsername').prop('value');
	var proxyPassword = $('#txtProxyPassword').prop('value');
	var useRules = $('#checkSmartRules').is(':checked');
	var rulesUrl = $('#txtRulesUrl').prop('value');

	if(isEmpty(profileName)){
		alert('Profile name cannot be emtpy!');
		return;
	}
	if(proxyScheme === 'pac'){
		if(isEmpty(proxyHost)){
			alert('PAC URL cannot be empty!');
			return;
		}
		
	}else if(isEmpty(proxyHost)){
		alert('Proxy host cannot be empty!');
		return;
	}else if(isEmpty(proxyPort)){
		alert('Proxy port cannot be empty!');
		return;
	}
	
	$('#addProxyBtn').show();
	$('#addProxyForm').remove();

	saveProxy(profileId, profileName, proxyScheme, proxyHost, proxyPort, proxyUsername, proxyPassword, useRules, rulesUrl);
	window.location.reload(true);
});	
$(document).on('click', '#addProxy #cancelBtn', function(){
	$('#addProxyBtn').show();
	$('#addProxyForm').remove();
});
$(document).on('change', '#txtProxyScheme', function(){
	if(this.value === 'pac'){
		$('#lblProxyHost').text('PAC URL:');
		$('#txtProxyHost').prop('type', 'url');
		$('#lblProxyPort').hide();
		$('#txtProxyPort').hide();
		$('#lblProxyUsername').hide();
		$('#txtProxyUsername').hide();
		$('#lblProxyPassword').hide();
		$('#txtProxyPassword').hide();
		$('#trSmart').hide();
	}
	else{
		$('#lblProxyHost').text('Proxy Host:');
		$('#txtProxyHost').prop('type','text');
		$('#lblProxyPort').show();
		$('#txtProxyPort').show();
		$('#lblProxyUsername').show();
		$('#txtProxyUsername').show();
		$('#lblProxyPassword').show();
		$('#txtProxyPassword').show();
		$('#trSmart').show();
		
	}
});

function closeOtherForms(){
	$('[id="editProxyBtn"]').show();
	$('[id="editProxyForm"]').remove();
	$('[id="addProxyBtn"]').show();
	$('[id="addProxyForm"]').remove();
}
$(document).on('click', '#proxyList #editProxyBtn', function(){
	closeOtherForms();

	var profileId = $(this).data('profileid');
	var currNode = $(this);
	chrome.storage.local.get(profileId, function(profileDataObj){
		var profileData = profileDataObj[profileId];
		if(isEmpty(profileData)) return;

		var paras = profileData.split('|');
		currNode.after('<form id="editProxyForm"><fieldset>\n'+
			'<legend>Edit Proxy</legend>\n'+
			'<table align="center">\n'+
			'<tr>\n'+
			'	<td><label id="lblProfileName">Profile Name:</label></td>\n'+
			'	<td><input type="text" id="txtProfileName" value="'+paras[0]+'" /></td>\n'+
			'</tr>\n'+
			'<tr>\n'+
			'	<td><label id="lblProxyScheme">Scheme:</label></td>\n'+
			'	<td><select id="txtProxyScheme">\n'+
			'		<option '+ (paras[1] === 'http'?'selected':'') +' value="http">http</option>\n'+
			'		<option '+ (paras[1] === 'https'?'selected':'') +' value="https">https</option>\n'+
			'		<option '+ (paras[1] === 'socks4'?'selected':'') +' value="socks4">socks4</option>\n'+
			'		<option '+ (paras[1] === 'socks5'?'selected':'') +' value="socks5">socks5</option>\n'+
			'		<option '+ (paras[1] === 'pac'?'selected':'') +' value="pac">pac</option>\n'+
			'	</select></td>\n'+
			'</tr>\n'+
	        '<tr>\n'+
		    '    <td><label id="lblProxyHost">Proxy Host:</label></td>\n'+
		    '    <td><input type="text" id="txtProxyHost" value="'+paras[2]+'" /></td>\n'+
	        '</tr>\n'+
	        '<tr>\n'+
	        '	<td><label id="lblProxyPort">Port:</label></td>\n'+
	        '	<td><input type="text" id="txtProxyPort" value="'+paras[3]+'" /></td>\n'+
	        '</tr>\n'+
	        '<tr>\n'+
	        '	<td><label id="lblProxyUsername">Username:</label></td>\n'+
	        '	<td><input type="text" id="txtProxyUsername" value="'+paras[4]+'" /></td>\n'+
	        '</tr>\n'+
	        '<tr>\n'+
	        '	<td><label id="lblProxyPassword">Password:</label></td>\n'+
	        '	<td><input type="password" id="txtProxyPassword" value="'+paras[5]+'" /></td>\n'+
	        '</tr>\n'+
	        '<tr id="trSmart">\n'+
	        '	<td><input type="checkbox" id="checkSmartRules" '+(paras[6] === 'true'?'checked':'')+'/><div id="lblRulesUrl">Smart Rules:<ul id="smartRulesTooltip"><li>Compatible with AutoProxy rules and Adblock Plus rules.</li><li>Rules are either Base64-encoded or plaintext (one rule per line).</li><li>Please fill in the rules url and select the checkbox.</li></ul></div></td>\n'+
	        '	<td><input type="url" id="txtRulesUrl" value="'+(isEmpty(paras[7])?'':paras[7])+'" /></td>\n'+
	        '</tr>\n'+
			'<tr>\n'+
			'	<td><button type="submit" id="submitBtn" data-profileid="'+profileId+'">Save</button></td>\n'+
			'	<td><button id="cancelBtn">Cancel</button>&nbsp;&nbsp;\n'+
			'	<button id="deleteProxyBtn" data-profileid="'+profileId+'">Delete</button></td>\n'+
			'</tr>\n'+
			'</table>\n'+
			'</fieldset></form>');
		$('#txtProxyScheme').trigger('change');
		currNode.hide();
	});
});
$(document).on('click submit', '#editProxyForm #submitBtn', function(){
	var profileId = $(this).data('profileid');
	var profileName = $('#txtProfileName').prop('value');
	var proxyScheme = $('#txtProxyScheme').prop('value');
	var proxyHost = $('#txtProxyHost').prop('value');
	var proxyPort = $('#txtProxyPort').prop('value');
	var proxyUsername = $('#txtProxyUsername').prop('value');
	var proxyPassword = $('#txtProxyPassword').prop('value');
	var useRules = $('#checkSmartRules').is(':checked');
	var rulesUrl = $('#txtRulesUrl').prop('value');

	if(isEmpty(profileName)){
		alert('Profile name cannot be emtpy!');
		return;
	}
	if(proxyScheme === 'pac'){
		if(isEmpty(proxyHost)){
			alert('PAC URL cannot be empty!');
			return;
		}
	}else if(isEmpty(proxyHost)){
		alert('Proxy host cannot be empty!');
		return;
	}else if(isEmpty(proxyPort)){
		alert('Proxy port cannot be empty!');
		return;
	}
	
	$('#editProxyForm').prev('#editProxyBtn').prev('label').text(profileName);
	$('#editProxyForm').prev('#editProxyBtn').show();
	$('#editProxyForm').remove();

	saveProxy(profileId, profileName, proxyScheme, proxyHost, proxyPort, proxyUsername, proxyPassword, useRules, rulesUrl);
});
$(document).on('click', '#editProxyForm #cancelBtn', function(){
	$('#editProxyForm').prev('#editProxyBtn').show();
	$('#editProxyForm').remove();
});
$(document).on('click', '#editProxyForm #deleteProxyBtn', function(){
	var profileId = $(this).data('profileid');
	chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
		var lastProfileId = lastProfileIdObj['lastProfileId'];
		if(lastProfileId === profileId){
			chrome.storage.local.set({'lastProfileId': 'profile-direct'});
		}
		chrome.storage.local.remove(profileId, function(){
			$('#editProxyForm').remove();
			loadProxy();
		});
	});
});

function addProxy(){
	closeOtherForms();

	var profileId = 'profile-'+$.now();
	$('#addProxyBtn').after('<form id="addProxyForm"><fieldset>\n'+
		'<legend>Add Proxy</legend>\n'+
		'<table align="center">\n'+
		'	<tr>\n'+
		'		<td><label id="lblProfileName">Profile Name:</label></td>\n'+
		'		<td><input type="text" id="txtProfileName" /></td>\n'+
		'	</tr>\n'+
		'	<tr>\n'+
		'		<td><label id="lblProxyScheme">Scheme:</label></td>\n'+
		'		<td><select id="txtProxyScheme">\n'+
		'			<option selected value="http">http</option>\n'+
		'			<option value="https">https</option>\n'+
		'			<option value="socks4">socks4</option>\n'+
		'			<option value="socks5">socks5</option>\n'+
		'			<option value="pac">pac</option>\n'+
		'		</select></td>\n'+
		'	</tr>\n'+
        '	<tr>\n'+
        '		<td><label id="lblProxyHost">Proxy Host:</label></td>\n'+
        '		<td><input type="text" id="txtProxyHost" /></td>\n'+
        '	</tr>\n'+
        '	<tr>\n'+
        '		<td><label id="lblProxyPort">Port:</label></td>\n'+
        '		<td><input type="text" id="txtProxyPort" /></td>\n'+
        '	</tr>\n'+
        '	<tr>\n'+
        '		<td><label id="lblProxyUsername">Username:</label></td>\n'+
        '		<td><input type="text" id="txtProxyUsername" /></td>\n'+
        '	</tr>\n'+
        '	<tr>\n'+
	    '    	<td><label id="lblProxyPassword">Password:</label></td>\n'+
	    '    	<td><input type="password" id="txtProxyPassword" /></td>\n'+
        '	</tr>\n'+
        '	<tr id="trSmart">\n'+
	    '    	<td><input type="checkbox" id="checkSmartRules" /><div id="lblRulesUrl">Smart Rules:<ul id="smartRulesTooltip"><li>Compatible with AutoProxy rules and Adblock Plus rules.</li><li>Rules are either Base64-encoded or plaintext (one rule per line).</li><li>Please fill in the rules url and select the checkbox.</li></ul></div></td>\n'+
	    '    	<td><input type="url" id="txtRulesUrl" /></td>\n'+
        '	</tr>\n'+
		'	<tr>\n'+
		'		<td><button type="submit" id="submitBtn" data-profileid="'+profileId+'">Save</button></td>\n'+
		'		<td><button id="cancelBtn">Cancel</button></td>\n'+
		'	</tr>\n'+
		'</table>\n'+
		'</fieldset></form>');
	$('#addProxyBtn').hide();
}

function saveProxy(profileId, profileName, scheme, host, port, username, password, useRules, rulesUrl){
	if(scheme === 'pac'){
		port = username = password = rulesUrl = '';
		useRules = false;
	}

	chrome.storage.local.get(profileId, function(profileDataObj){
		var profileData = profileDataObj[profileId];
		
		var profileNewData = [profileName, scheme, host, port, username, password, useRules, rulesUrl].join('|');
		if(profileNewData !== profileData){
			var obj = {};
			obj[profileId] = profileNewData;
			chrome.storage.local.set(obj);
		}
		
		chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
			var lastProfileId = lastProfileIdObj['lastProfileId'];
			if(lastProfileId === profileId){
				setProxyWithData(false, profileNewData);
			}
		});
	});
}

function loadProxy(){
	chrome.storage.local.get(null, function(items) {
		var lastProfileId = isEmpty(items['lastProfileId']) ? 'profile-direct' : items['lastProfileId'];
		// direct profile
		var checkedStatus = (lastProfileId === 'profile-direct') ? "checked" : '';
		$('#proxyList').html('\
			<input type="radio" '+checkedStatus+' id="setProxyBtn" data-profileid="profile-direct" /><label>direct</label><hr />\
		');
		// proxy profiles
	    for (key in items) {
	    	if(key.startsWith('profile-')){
	    		var profileId = key;
	    		var profileData = items[key];
	    		if(isEmpty(profileData)) return;
				var paras = profileData.split('|');
				var checkedStatus = (lastProfileId === profileId) ? "checked" : '';
				$('#proxyList').append('\
					<input type="radio" '+checkedStatus+' id="setProxyBtn" data-profileid="'+profileId+'" /><label>'+paras[0]+'</label> <button id="editProxyBtn" data-profileid="'+profileId+'">Edit</button><hr />\
				');
	    	}
	    }
	});
}

function isEmpty(val){
	return val === null || val === '' || jQuery.isEmptyObject(val);
}

function setProxyWithData(isDirect, profileData){
	if(isDirect){
		var config = { mode: "direct" };
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});
		
		chrome.browserAction.setIcon({
			path: {
				'19': '../images/icon19.png',
				'38': '../images/icon38.png'
			}
		});

		return;
	}

	if(isEmpty(profileData)) return;

	var paras = profileData.split('|');

	if(paras[1] === 'pac'){
		//reset to direct
		var config = { mode: "direct" };
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});

		//set proxy
		config = {
			mode: "pac_script",
			pacScript: {
			  url: paras[2]
			}
		};
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});

		//update icon
		chrome.browserAction.setIcon({
			path: {
				'19': '../images/icon19-running.png',
				'38': '../images/icon38-running.png'
			}
		});
	}else if(paras[6] === 'true'){
		//reset to direct
		var config = { mode: "direct" };
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});
		//update icon
		chrome.browserAction.setIcon({
			path: {
				'19': '../images/icon19.png',
				'38': '../images/icon38.png'
			}
		});

		updateRules(paras[7], paras[1], paras[2], paras[3]);
	}else{
		//set proxy
		var config = {
			mode: "fixed_servers",
			rules: {
			    singleProxy: {
					scheme: paras[1],
					host: paras[2],
					port: parseInt(paras[3])
			    },
			    bypassList: ["127.0.0.1/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "<local>"]
			}
		};
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});

		//update icon
		chrome.browserAction.setIcon({
			path: {
				'19': '../images/icon19-running.png',
				'38': '../images/icon38-running.png'
			}
		});
				
	}
}

function setProxy(profileId){
	if(profileId === 'profile-direct'){
		setProxyWithData(true, null);
	}else{
		chrome.storage.local.get(profileId, function(profileDataObj){
			var profileData = profileDataObj[profileId];
			setProxyWithData(false, profileData);
		});
	}
}

function updateRules(url, proxyType, proxyHost, proxyPort, tryCnt = 1){
	//fetch rules
	$.get(url, function(data){
		var rulesDecoded = '';
		try{//base64
			var dataRaw = data.replace('\n', '');
			rulesDecoded = atob(dataRaw);
		}catch(e){
			//raw data
			rulesDecoded = data;
		}
		//parse
		var lines = rulesDecoded.split('\n');
		var rules = new Array();
		for (var i = 0; i < lines.length; i++){
			var oneRule = '';
			var line = lines[i].trim();
			line = line.replace('http://', '');
			line = line.replace('https://', '');
			if(isEmpty(line) 
				|| line[0] === '!'
				|| line.startsWith('@@')
				|| line.includes('[AutoProxy')
				|| !line.includes('.') ) continue;
			if(line.startsWith('||'))
				oneRule = line.substr(2);
			else if(line[0] === '|')
				oneRule = line.substr(1);
			else if(line.includes('\/'))
				continue;
			else if(line[0] === '.')
				oneRule = line.substr(1);
			else
				oneRule = line;
			var pos = oneRule.indexOf('/');
			if(pos !== -1){
				var dotpos = oneRule.indexOf('.');
				if(dotpos !== -1 && dotpos > pos)
					oneRule = oneRule.substr(dotpos+1);
				else
					oneRule = oneRule.substr(0, pos);
			}

			oneRule = '\''+oneRule+'\':1';
			rules.push(oneRule);
		}
		rules.push('\'naver.jp\':1');
		rules.push('\'edgesuite.net\':1');
		var domainList = rules.join(',');
		var pacProxyType = '';
		if(proxyType === 'socks4') pacProxyType = 'SOCKS';
		else if(proxyType === 'socks5') pacProxyType = 'SOCKS5';
		else pacProxyType = 'PROXY';
		var pacData = 'var proxy ="'+pacProxyType+' '+proxyHost+':'+proxyPort+'; DIRECT;"\n'+
'var direct = "DIRECT;";\n'+
'var domains = {'+domainList+'};\n'+
`var hasOwnProperty = Object.hasOwnProperty\n; 
function FindProxyForURL(url, host) { \n
    if(isPlainHostName(host) || shExpMatch(host, "*.local")  || (/^(\\d+\\.){3}\\d+$/.test(host) && (shExpMatch(host, "10.*") || shExpMatch(host, "127.*") || shExpMatch(host, "192.168.*") || /^172\\.(1[6-9]|2[0-9]|3[0-1])\\.\\d+\\.\\d+$/.test(host)))){\n
		return direct;\n
	}
	if(/^(.*\\.?)(google|blogspot)\\.(.*)$/.test(host)){\n
		return proxy;\n
	}\n
	var suffix;\n
	var pos = host.lastIndexOf(".");\n
	pos = host.lastIndexOf(".", pos - 1);\n
    while(1) {\n
        if (pos <= 0) {\n
            if (hasOwnProperty.call(domains, host)) {\n
                return proxy;\n
            } else {\n
            	return direct;\n
            }\n
        }\n
		suffix = host.substring(pos + 1);\n
        if (hasOwnProperty.call(domains, suffix)) {\n
        	return proxy;\n
        }\n
        pos = host.lastIndexOf(".", pos - 1);\n
	}\n
}`;

		//set proxy
		var config = {
				mode: "pac_script",
				pacScript: {
				  data: pacData
				}
			};
		chrome.proxy.settings.set(
			{value: config, scope: 'regular'},
			function() {});

		//update icon
		chrome.browserAction.setIcon({
			path: {
				'19': '../images/icon19-running.png',
				'38': '../images/icon38-running.png'
			}
		});
	}).fail(function(){
		if(tryCnt >= 3){
			document.body.innerHTML += '<dialog><b>Fail to fetch rules.<br />Please check the rules url and try again.</b><p></p><div align="center"><button>Close</button></div></dialog>';
	        var dialog = document.querySelector('dialog');
	        dialog.querySelector('button').addEventListener('click', function() {
	            dialog.close();
	        })
	        dialog.showModal();
			return;
		}else{
			updateRules(url, proxyType, proxyHost, proxyPort, tryCnt+1);
		}
	});
}

chrome.runtime.onUpdateAvailable.addListener(function(){
	chrome.runtime.reload();
});

chrome.runtime.onStartup.addListener(function(){
	chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
		var lastProfileId = lastProfileIdObj['lastProfileId'];
		setProxy(lastProfileId);
	});
});

chrome.runtime.onInstalled.addListener(function(){
	if(localStorage.length > 0){
		var data = {};
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if(key === 'rev') continue;
			data[key] = localStorage.getItem(key);
		}
	
		chrome.storage.local.clear();
		chrome.storage.local.set(data);
		localStorage.clear();
	}

	chrome.storage.sync.get(null, function(items){
		chrome.storage.local.set(items);
	});

	chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
		var lastProfileId = lastProfileIdObj['lastProfileId'];
		
		if(isEmpty(lastProfileId)){
			chrome.storage.local.set({'lastProfileId': 'profile-direct'});
		}
		
		setProxy(lastProfileId);
	});

});

chrome.storage.onChanged.addListener(function(changes, namespace){
	var storageToBeChanged = namespace === 'local' ? chrome.storage.sync : chrome.storage.local;
	for (key in changes) {
		var storageChange = changes[key];		
		if(isEmpty(storageChange.newValue)){
			storageToBeChanged.remove(key);
		}else{
			var obj = {};
			obj[key] = storageChange.newValue;
			storageToBeChanged.set(obj);
		}
    }
});

chrome.webRequest.onAuthRequired.addListener(
	function(details, callbackFn) {
		if(details.isProxy === false){
			callbackFn();
			return;
		}

		chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
			var lastProfileId = lastProfileIdObj['lastProfileId'];
			chrome.storage.local.get(lastProfileId, function(profileDataObj){
				var profileData = profileDataObj[lastProfileId];
				var paras = profileData.split('|');
				callbackFn({
				    authCredentials: {username: paras[4], password: paras[5]}
				});
			});
		});
	},
	{urls: ["<all_urls>"]},
	['asyncBlocking']
);


class FryDos {
    constructor(views, surveyId, projectId, selector) {
        this.id = surveyId;
        this.project = projectId;
        this.views = views;
        this.selector = selector;
        this.contact = null;
        this.submitedId = null;
        this.submitedValue = null;
    }
    renderFirst() {
        this.selector.innerHTML = this.views.first;
    }
    getBrowserId() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

   
        if (Sys.ie) return 'IE: ' + Sys.ie;
        if (Sys.firefox) return 'Firefox: ' + Sys.firefox;
        if (Sys.chrome) return 'Chrome: ' + Sys.chrome;
        if (Sys.opera) return 'Opera: ' + Sys.opera;
        if (Sys.safari) return 'Safari: ' + Sys.safari;
    }
    async createContact() {
        const data = {
            name: this.getBrowserId(),
            email: null,
            customFields: null,
            owner: this.project
        };
        const response = await fetch('http://localhost:8000/api/project/'+this.project+'/contacts/', {
            method: "POST", 
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log(result);
        this.setCookie("frydos-client-cookie", result.id, 99);
        this.contact = result.id;
    }
    setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    getCookie(cname) {
        var match = document.cookie.match(new RegExp('(^| )' + cname + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }
    async submitSurvey(val, nextView) {
        this.contact = this.getCookie("frydos-client-cookie");
        console.log(this.contact);
        if (this.contact === null || this.contact === "undefined") {
            await this.createContact();
        }
        const data = {
            value: val,
            contact: this.contact,
            survey: this.id,
            previousSubmit: this.submitedId || null
        }
        const url = 'http://localhost:8000/api/project/'+projectID+'/surveys/'+frydosID+'/submits/';
        const response = await fetch(url, {
            method: "POST", 
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        this.submitedId = result.id;
        this.submitedValue = result.value;
        this.selector.innerHTML = this.views[nextView];
    }
}
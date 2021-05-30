class FryDos {
    constructor(views, surveyId, projectId, selector, api) {
        if (!api) {
            api = "https://api.frydos.com";
        }
        this.id = surveyId;
        this.project = projectId;
        this.views = views;
        this.views.push({html:"", type: "thankyou"});
        this.selector = selector;
        this.contact = null;
        this.submitedId = null;
        this.activeStep = {};
        this.nextStep = {};
        this.responseHTML = "";
        this.api = api;
    }
    renderFirstStep() {
        this.setStepDataById(this.views[0].id);
        this.selector.innerHTML = this.activeStep.html;
    }
    renderNextStep() {
        if (this.nextStep.type === "condition") {
            const stepValue = this.submitedValues[this.nextStep.condition.what];
            let result = null;

            if (this.nextStep.condition.operator === "equal") {
                result = stepValue === this.nextStep.condition.to;
            } else if (this.nextStep.condition.operator === "not-equal") {
                result = stepValue !== this.nextStep.condition.to;
            } else if (this.nextStep.condition.operator === "less-than") {
                result = stepValue < this.nextStep.condition.to;
            } else if (this.nextStep.condition.operator === "more-than") {
                result = stepValue > this.nextStep.condition.to;
            }

            const newStepId = result ? this.nextStep.trueList[0].id : this.nextStep.falseList[0].id;
            this.setStepDataById(newStepId);
        } else {
            this.setStepDataById(this.nextStep.id);
        }

        this.selector.innerHTML = this.activeStep.html;
    }
    setStepDataById(id) {
        this.views.forEach((view, i) => {
            if (view.type === "condition") {
                view.trueList.forEach(trueView => {
                    if (trueList.id === id) {
                        this.activeStep = trueView;
                        this.nextStep = this.getNextStep(trueList, id, {view, i});
                    }
                });
                view.falseList.forEach(falseView => {
                    if (falseList.id === id) {
                        this.activeStep = falseView;
                        this.nextStep = this.getNextStep(falseList, id, {view, i});
                    }
                });
            } else {
                this.activeStep = view;
                this.nextStep = this.getNextStep(this.views, id);
            }
        });
    }
    getNextStep(array, id, rootViewData = {}) {
        const stepIndex = array.map(function (o) { return o.id; }).indexOf(id);
        const nextStepIndex = stepIndex++;
        if (array.length > nextStepIndex) {
            return array[nextStepIndex];
        }
        return rootViewData.view[i++]
    }
    getNextStepById(id) {
        this.views.forEach((view, it) => {
            if (view.type === "condition") {
                view.trueList.forEach((trueView, ib) => {
                    if (trueList.id === id) {
                        return trueList;
                    }
                });
                view.falseList.forEach((falseView, ib) => {
                    if (falseList.id === id) return falseList;
                });
            } else {
                return view;
            }
        });
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
        const response = await fetch(`${this.api}/api/project/${this.project}/contacts/`, {
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
        const locationUrl = window.location.href;
        console.log(this.contact);
        this.selector.innerHTML = "<div class='frydos-loader'></div>";
        if (this.contact === null || this.contact === "undefined") {
            await this.createContact();
        }
        const data = {
            value: val,
            contact: this.contact,
            survey: this.id,
            url: locationUrl,
            previousSubmit: this.submitedId || null
        }
        const url = `${this.api}/api/project/${projectID}/surveys/${frydosID}/submits/`;
        const response = await fetch(url, {
            method: "POST", 
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .catch(function (error) {
            this.selector.innerHTML = '<div class="frydos-flex"><p>Something went wrong with submiting your response. Please try it later...</p></div>';
            console.error(`Submitting survey errod: ${error}`);
            return;
        });
        const result = await response.json();
        this.submitedId = result.id;
        this.submitedValues[this.activeView.id] = result.value;
        this.renderNextStep();
        this.responseHTML = result.responseHTML;
        this.selector.innerHTML = this.views[nextView];
    }
}
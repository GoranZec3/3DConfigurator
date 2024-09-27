// ARButton.js
class ARButton {

    static createButton(renderer, sessionInit = {}, positionClass = 'default-position') {
        const button = document.createElement('button');
        button.classList.add('ar-button', positionClass); // Add classes for styling

        function showStartAR() {
            if (sessionInit.domOverlay === undefined) {
                 const overlay = document.createElement('div');
                 overlay.style.display = 'none';
                document.body.appendChild(overlay);
                document.querySelector('.ar-div').appendChild(button);

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', 38);
                svg.setAttribute('height', 38);
                svg.classList.add('ar-overlay-svg');
                svg.addEventListener('click', function () {
                    currentSession.end();
                });
                overlay.appendChild(svg);

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28');
                path.setAttribute('stroke', '#fff');
                path.setAttribute('stroke-width', 2);
                svg.appendChild(path);

                if (sessionInit.optionalFeatures === undefined) {
                    sessionInit.optionalFeatures = [];
                }

                sessionInit.optionalFeatures.push('dom-overlay');
                sessionInit.domOverlay = { root: overlay };
            }

            let currentSession = null;

            async function onSessionStarted(session) {
                session.addEventListener('end', onSessionEnded);
                renderer.xr.setReferenceSpaceType('local');
                await renderer.xr.setSession(session);
                button.textContent = 'STOP AR';
                sessionInit.domOverlay.root.style.display = '';
                currentSession = session;
            }

            function onSessionEnded() {
                currentSession.removeEventListener('end', onSessionEnded);
                button.textContent = 'START AR';
                sessionInit.domOverlay.root.style.display = 'none';
                currentSession = null;
            }

            button.textContent = 'START AR';
            button.classList.remove('ar-button--inactive');
            button.classList.add('ar-button--active');

            button.onclick = function () {
                if (currentSession === null) {
                    navigator.xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);
                } else {
                    currentSession.end();
                    if (navigator.xr.offerSession !== undefined) {
                        navigator.xr.offerSession('immersive-ar', sessionInit)
                            .then(onSessionStarted)
                            .catch((err) => {
                                console.warn(err);
                            });
                    }
                }
            };

            if (navigator.xr.offerSession !== undefined) {
                navigator.xr.offerSession('immersive-ar', sessionInit)
                    .then(onSessionStarted)
                    .catch((err) => {
                        console.warn(err);
                    });
            }
        }

        function disableButton() {
            button.classList.remove('ar-button--active');
            button.classList.add('ar-button--inactive');
            button.textContent = 'AR NOT SUPPORTED';
        }

        function showARNotSupported() {
            disableButton();
        }

        function showARNotAllowed(exception) {
            disableButton();
            console.warn('Exception when trying to call xr.isSessionSupported', exception);
            button.textContent = 'AR NOT ALLOWED';
        }

        if ('xr' in navigator) {
            button.id = 'ARButton';
            button.classList.add('ar-button--inactive');

            navigator.xr.isSessionSupported('immersive-ar').then(function (supported) {
                supported ? showStartAR() : showARNotSupported();
            }).catch(showARNotAllowed);

            return button;
        } else {
            const message = document.createElement('a');
            message.href = window.isSecureContext === false ? document.location.href.replace(/^http:/, 'https:') : 'https://immersiveweb.dev/';
            message.innerHTML = window.isSecureContext === false ? 'WEBXR NEEDS HTTPS' : 'WEBXR NOT AVAILABLE';
            message.classList.add('ar-message');
            return message;
        }
    }
}

export { ARButton };

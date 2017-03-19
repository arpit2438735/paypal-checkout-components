/* @flow */

import { assert } from 'chai';

import 'src/load';
import { config } from 'src/config';

import { onHashChange, generateECToken, createTestContainer, destroyTestContainer, getElement, setupPopupBridge, destroyPopupBridge, uniqueID, CHILD_REDIRECT_URI } from '../common';

for (let flow of [ 'popup', 'lightbox' ]) {

    describe(`paypal legacy bridge checkout setup/startflow on ${flow}`, () => {

        beforeEach(() => {
            createTestContainer();
            window.paypal.Checkout.contexts.lightbox = (flow === 'lightbox');

            setupPopupBridge();
        });

        afterEach(() => {
            destroyTestContainer();
            window.location.hash = '';
            window.paypal.Checkout.contexts.lightbox = false;

            destroyPopupBridge();
        });

        it('should render a button into a container and click on the button, then call startFlow', () => {

            let token = generateECToken();

            return window.paypal.checkout.setup('merchantID', {

                container: 'testContainer',

                click(event) {
                    window.paypal.checkout.startFlow(token);
                }

            }).then(() => {

                getElement('#testContainer button').click();

                return onHashChange().then(urlHash => {
                    assert.equal(urlHash, `#return?token=${token}&PayerID=YYYYYYYYYYYYY`);
                });
            });
        });

        it('should render a button into a container and click on the button, then call startFlow with a cancel', () => {

            setupPopupBridge({ isAuthorize: false });

            let token = generateECToken();

            return window.paypal.checkout.setup('merchantID', {

                container: 'testContainer',

                click(event) {
                    window.paypal.checkout.startFlow(token);
                }

            }).then(() => {

                window.paypal.Checkout.props.test.def = () => ({ action: 'cancel' });

                getElement('#testContainer button').click();

                return onHashChange().then(urlHash => {
                    window.paypal.Checkout.props.test.def = () => ({ action: 'checkout' });
                    assert.equal(urlHash, `#cancel?token=${token}`);
                });
            });
        });

        it('should render a button into a container and click on the button, then call startFlow with a url', () => {

            let token = generateECToken();
            let hash = uniqueID();

            return window.paypal.checkout.setup('merchantID', {

                container: 'testContainer',

                click(event) {
                    window.paypal.checkout.startFlow(`${config.checkoutUrl}&token=${token}#${hash}`);
                }

            }).then(() => {

                getElement('#testContainer button').click();

                return onHashChange().then(urlHash => {
                    assert.equal(urlHash, `#return?token=${token}&PayerID=YYYYYYYYYYYYY&hash=${hash}`);
                });
            });
        });

        it('should render a button into a container and click on the button, then call startFlow with a url with no token', () => {

            let hash = uniqueID();

            return window.paypal.checkout.setup('merchantID', {

                container: 'testContainer',

                click(event) {
                    window.paypal.checkout.startFlow(`${CHILD_REDIRECT_URI}#${hash}`);
                }

            }).then(() => {

                getElement('#testContainer button').click();

                return onHashChange().then(urlHash => {
                    assert.equal(urlHash, `#return?token=EC-XXXXXXXXXXXXXXXXX&PayerID=YYYYYYYYYYYYY&hash=${hash}`);
                });
            });
        });
    });
}
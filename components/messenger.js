/**
 * @overview Messenger Component for <i>ccm</i>
 * @author Marco Giesen <marco.giesen93@gmail.com> 2015-2016
 */

ccm.component({

    /*-------------------------------------------- public component members --------------------------------------------*/

    /**
     * @summary component name
     * @memberOf ccm.components.messenger
     * @type {ccm.name}
     */
    name: 'messenger',

    /**
     * @summary default instance configuration
     * @memberOf ccm.components.messenger
     * @type {ccm.components.messenger.config}
     */
    config: {

        html: [ccm.store, {local: 'json/messenger_html.json'}],
        key: 'messenger',
        //store: [ccm.store, {store: 'messenger', url: 'wss://ccm.inf.h-brs.de:8888/index.js'}],
        store: [ccm.store, {local: 'json/messenger_data.json'}],
        style: [ccm.store, {local: 'css/messenger.css'}],
        user: [ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js']
        // ...

    },

    /*-------------------------------------------- public component classes --------------------------------------------*/

    /**
     * @summary constructor for creating <i>ccm</i> instances out of this component
     * @alias ccm.components.messenger.Messenger
     * @class
     */
    Instance: function () {

        /*------------------------------------- private and public instance members --------------------------------------*/

        /**
         * @summary own context
         * @private
         */
        var self = this;

        // ...

        /*------------------------------------------- public instance methods --------------------------------------------*/

        /**
         * @summary initialize <i>ccm</i> instance
         * @description
         * Called one-time when this <i>ccm</i> instance is created, all dependencies are solved and before dependent <i>ccm</i> components, instances and datastores are initialized.
         * This method will be removed by <i>ccm</i> after the one-time call.
         * @param {function} callback - callback when this instance is initialized
         */
        self.init = function (callback) {

            self.store.onChange = function () {
                self.render();
            };

            callback();

        };

        /**
         * @summary when <i>ccm</i> instance is ready
         * @description
         * Called one-time when this <i>ccm</i> instance and dependent <i>ccm</i> components, instances and datastores are initialized and ready.
         * This method will be removed by <i>ccm</i> after the one-time call.
         * @param {function} callback - callback when this instance is ready
         */
        this.ready = function (callback) {

            // ...

            // perform callback
            callback();

        };

        /**
         * @summary render content in own website area
         * @param {function} [callback] - callback when content is rendered
         */
        this.render = function (callback) {


            self.user.login(function () {
                self.store.get(self.user.data().key, function (dataset) {
                    renderMainView(dataset);
                });
            });
            /**
             * website area for own content
             * @type {ccm.element}
             */

            function renderMainView(dataset) {
                var element = ccm.helper.element(self);
                element.html(ccm.helper.html(self.html.get('main')));

                var chatOverviewDiv = ccm.helper.find(self, '.chat-overview');
                var messageChat = ccm.helper.find(self, '.messages');
                var header = ccm.helper.find(self, '.header');

                var userChatData = dataset;

                console.log(userChatData);

                if (userChatData === null) {
                    self.store.setParameter(self.user.data().key, []);
                    userChatData = self.store.get(self.user.data().key);
                }

                renderHeader(header, self.user.data().key);
                renderChats(chatOverviewDiv, userChatData.chats);
            }

            function renderHeader(divToAppend, username) {
                divToAppend.append(ccm.helper.html(self.html.get('userInfo'), {
                    username: ccm.helper.val(username)
                }));
                divToAppend.append(ccm.helper.html(self.html.get('inputChat'), {
                    onsubmit: function () {
                        // new message in chat and reload logic here
                        return false;
                    }
                }));
            }

            function renderChats(divToAppend, chats) {
                chats.forEach(function (chat) {
                    var dbChat = self.store.get(chat);

                    divToAppend.append(ccm.helper.html(self.html.get('chat'), {
                        name: ccm.helper.val(chat),
                        onclick: function () {
                            loadChat(chat);

                            return false;
                        }
                    }));
                });
            }

            function loadChat(chatId) {
                var messageChat = ccm.helper.find(self, '.messages');
                var messageData = self.store.get(chatId).messages;

                messageChat.html('');

                console.log(messageData);

                messageData.forEach(function (message) {
                    messageChat.append(ccm.helper.html(self.html.get('message'), {

                        name: ccm.helper.val(message.from),
                        text: ccm.helper.val(message.text)

                    }));
                });

                messageChat.append(ccm.helper.html(self.html.get('inputMessage'), {
                    onsubmit: function () {
                        // new message in chat and reload logic here
                        return false;
                    }
                }));
            }
        };

    }

    /*------------------------------------------------ type definitions ------------------------------------------------*/

    /**
     * @namespace ccm.components.messenger
     */

    /**
     * @summary <i>ccm</i> instance configuration
     * @typedef {ccm.config} ccm.components.messenger.config
     * @property {string} classes - css classes for own website area
     * @property {ccm.element} element - own website area
     * @property {Object.<ccm.key, ccm.html>} html - <i>ccm</i> html data templates for own content
     * @property {ccm.key} key - key of [messenger dataset]{@link ccm.components.messenger.dataset} for rendering
     * @property {ccm.store} store - <i>ccm</i> datastore that contains the [messenger dataset]{@link ccm.components.messenger.dataset} for rendering
     * @property {ccm.style} style - css for own content
     * ...
     */

    /**
     * @summary messenger dataset for rendering
     * @typedef {ccm.dataset} ccm.components.messenger.dataset
     * @property {ccm.key} key - dataset key
     * ...
     */

    // ...

});

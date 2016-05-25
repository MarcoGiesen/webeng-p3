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
        store: [ccm.store, {store: 'messenger', url: 'ws://ccm2.inf.h-brs.de/index.js'}],
        style: [ccm.store, {local: 'css/messenger.css'}],
        user: [ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js']
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
            // perform callback
            callback();
        };

        /**
         * @summary render content in own website area
         * @param {function} [callback] - callback when content is rendered
         */
        this.render = function (callback) {
            var data;
            var userKey;
            self.user.login(function () {
                var key = userKey = self.user.data().key;
                console.log('Account: ' + key);
                self.store.get(key, function (dataset) {
                    if (dataset === null) {
                        var key = self.user.data().key;
                        console.log({key: key, chats: []});
                        self.store.set({key: key, chats: []}, function () {
                            self.render();
                        });
                    } else {
                        data = dataset;
                        renderMainView(dataset);
                    }
                });
            });
            /**
             * website area for own content
             * @type {ccm.element}
             */

            function renderMainView(dataset) {
                var element = ccm.helper.element(self);
                element.html(ccm.helper.html(self.html.get('main')));

                var header = ccm.helper.find(self, '.header');

                renderHeader(header, self.user.data().key);
                renderChats(dataset.chats);
            }

            function renderHeader(divToAppend, username) {
                divToAppend.append(ccm.helper.html(self.html.get('userInfo'), {
                    username: ccm.helper.val(username)
                }));
                divToAppend.append(ccm.helper.html(self.html.get('inputChat'), {
                    onsubmit: function () {
                        var value = ccm.helper.val(ccm.helper.find(self, '.chat-input').val()).trim();

                        if (value === '') {
                            return false;
                        }

                        var timestamp = Math.floor((Math.random() * new Date().getUTCMilliseconds()) + new Date().getUTCMilliseconds());

                        self.store.set({
                            key: timestamp,
                            participants: [self.user.data().key, value],
                            messages: []
                        }, function () {
                            self.store.get(value, function (userData) {
                                if (userData === null) {
                                    self.store.set({key: value, chats: [timestamp]}, function () {
                                        console.log('new user created');
                                    });
                                } else {
                                    userData.chats.push(timestamp);
                                    self.store.set(userData, function () {
                                        console.log('added new conversation to user');
                                    });
                                }
                            });

                            data.chats.push(timestamp);

                            self.store.set(data, function () {
                                renderChats(data.chats);
                            });
                        });

                        return false;
                    }
                }));
            }

            function renderChats(chats) {
                var chatOverviewDiv = ccm.helper.find(self, '.chat-overview');
                chatOverviewDiv.html('');
                chats.forEach(function (chat) {
                    self.store.get(chat, function (chatData) {
                        var chatName = '';
                        var participants = chatData.participants;
                        /*var index = participants.indexOf(userKey);
                        if (index > -1) {
                            participants.splice(index, 1);
                        }*/
                        for(var i = 0; i < participants.length; i++) {
                            chatName += participants[i];
                            if(i+1 < participants.length) {
                                chatName += ', ';
                            }
                        }

                        console.log(chatData);

                        chatOverviewDiv.append(ccm.helper.html(self.html.get('chat'), {
                            name: ccm.helper.val(chatName),
                            onclick: function () {
                                loadChat(chat);

                                return false;
                            }
                        }));
                    });
                });
            }

            function loadChat(chatId) {
                var messageChat = ccm.helper.find(self, '.message-container');
                var inputChat = ccm.helper.find(self, '.message-input-container');
                var chatData = self.store.get(chatId);
                var messageData = chatData.messages;

                messageChat.html('');
                inputChat.html('');

                console.log(messageData);

                messageData.forEach(function (message) {
                    var template = 'message';
                    if(message.from == userKey) {
                        template = 'message-me';
                    }

                    messageChat.append(ccm.helper.html(self.html.get(template), {
                        name: ccm.helper.val(message.from),
                        text: ccm.helper.val(message.text)
                    }));
                });

                inputChat.append(ccm.helper.html(self.html.get('inputMessage'), {
                    onsubmit: function () {
                        var value = ccm.helper.val(ccm.helper.find(self, '.message-input').val()).trim();

                        if (value === '') {
                            return false;
                        }

                        chatData.messages.push({from: self.user.data().key, text: value});

                        self.store.set(chatData, function () {
                            loadChat(chatId);
                        });

                        return false;
                    }
                }));
            }

            if (callback) callback();
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
     */

    /**
     * @summary messenger dataset for rendering
     * @typedef {ccm.dataset} ccm.components.messenger.dataset
     * @property {ccm.key} key - dataset key
     * ...
     */

});

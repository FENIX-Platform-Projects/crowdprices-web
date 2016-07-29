/*global define*/
define([
    'underscore',
    'controllers/base/controller',
    'views/download-view',
    'config/events',
    'fx-common/AuthManager',
    'q',
    'amplify'
], function (_, Controller, View, EVT, AuthManager, Q) {

    'use strict';

    var DownloadController = Controller.extend({

        beforeAction: function () {
            Controller.prototype.beforeAction.apply(this, arguments);

            return this._performAccessControlChecks().then(
                undefined, _.bind(this._denyAccessControl, this));
        },

        _performAccessControlChecks: function () {
            var self = this;

            return new Q.Promise(function (fulfilled, rejected) {

                if (!new AuthManager().isLogged()) {
                    self.authorized = false;
                    rejected();
                    return;
                }

                fulfilled();
            });
        },

        _denyAccessControl: function () {

        },

        show: function () {

            if (this.authorized === false) {
                amplify.publish(EVT.notAuthorized);
                return;
            }

            this.view = new View({
                region: 'main'
            });
        }
    });

    return DownloadController;
});

/*
 * Copyright 2015 Anton Tananaev (anton@traccar.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('Traccar.view.CommandDialogController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.commandDialog',

    onSelect: function (selected) {
        this.lookupReference('paramPositionPeriodic').setHidden(
            selected.getValue() !== 'positionPeriodic');
        this.lookupReference('paramOutputControl').setHidden(
            selected.getValue() !== 'outputControl');
        this.lookupReference('paramSendSmsUssd').setHidden(
            selected.getValue() !== 'sendSms' && selected.getValue() !== 'sendUssd');
        this.lookupReference('paramSmsMessage').setHidden(
            selected.getValue() !== 'sendSms');
        this.lookupReference('paramCustom').setHidden(
            selected.getValue() !== 'custom');
    },

    onSendClick: function (button) {
        var attributes, value, record, form, index, phone;

        form = button.up('window').down('form');
        form.updateRecord();
        record = form.getRecord();

        if (record.get('type') === 'positionPeriodic') {
            attributes = this.lookupReference('paramPositionPeriodic');
            value = attributes.down('numberfield[name="frequency"]').getValue();
            value *= attributes.down('combobox[name="unit"]').getValue();

            record.set('attributes', {
                frequency: value
            });
        }

        if (record.get('type') === 'outputControl') {
            attributes = this.lookupReference('paramOutputControl');
            index = attributes.down('numberfield[name="index"]').getValue();
            value = attributes.down('textfield[name="data"]').getValue();

            record.set('attributes', {
                index: index,
                data: value
            });
        }

        if (record.get('type') === 'sendUssd') {
            attributes = this.lookupReference('paramSendSmsUssd');
            phone = attributes.down('textfield[name="phone"]').getValue();
            record.set('attributes', {
                phone: phone
            });
        }

        if (record.get('type') === 'sendSms') {
            attributes = this.lookupReference('paramSendSmsUssd');
            phone = attributes.down('textfield[name="phone"]').getValue();
            value = attributes.down('textfield[name="message"]').getValue();
            record.set('attributes', {
                phone: phone,
                message: value
            });
        }

        if (record.get('type') === 'custom') {
            value = this.lookupReference('paramCustom').getValue();
            record.set('attributes', {
                data: value
            });
        }

        Ext.Ajax.request({
            scope: this,
            url: 'api/commands',
            jsonData: record.getData(),
            callback: this.onSendResult
        });
    },

    onSendResult: function (options, success, response) {
        if (success) {
            Ext.toast(Strings.commandSent);
            this.closeView();
        } else {
            Traccar.app.showError(response);
        }
    }
});

'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const Profile = require('onf-core-model-ap/applicationPattern/onfModel/models/Profile');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const createHttpError = require('http-errors');

const profileConstants = Object.freeze({
  OPERATION_MODE_REACTIVE: 'string-profile-1-0:STRING_VALUE_TYPE_REACTIVE',
  OPERATION_MODE_PROTECTION: 'string-profile-1-0:STRING_VALUE_TYPE_PROTECTION',
  OPERATION_MODE_OFF: 'string-profile-1-0:STRING_VALUE_TYPE_OFF',
});


/**
 * Returns the name of the String
 **/
exports.getStringProfileStringName = async function (url) {
  let value = await fileOperation.readFromDatabaseAsync(url);
  if (!value) {
    value = "";
  }

  return {
    "string-profile-1-0:string-name": value
  };
}


/**
 * Returns the enumeration values of the String
 *
 * uuid String
 **/
exports.getStringProfileEnumeration = async function (url) {
  let value = await fileOperation.readFromDatabaseAsync(url);
  if (!value) {
    value = [];
  }

  return {
    "string-profile-1-0:enumeration": value
  };
}


/**
 * Returns the pattern of the String
 *
 * uuid String
 **/
exports.getStringProfilePattern = async function (url) {
  let value = await fileOperation.readFromDatabaseAsync(url);
  if (!value) {
    value = "";
  }

  return {
    "string-profile-1-0:pattern": value
  };
}


/**
 * Returns the configured value of the String
 **/
exports.getStringProfileStringValue = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "string-profile-1-0:string-value": value
  };
}


/**
 * Configures value of the String
 *
 * body Stringprofileconfiguration_stringvalue_body
 * no response value expected for this operation
 **/
exports.putStringProfileStringValue = async function (body, url) {
  const currentOperationModeValue = await exports.getOperationModeProfileStringValue();
  const newOperationModeValue = body['string-profile-1-0:string-value'];

  let profiles = await ProfileCollection.getProfileListForProfileNameAsync(Profile.profileNameEnum.STRING_PROFILE);
  let pac = profiles[0][onfAttributes.STRING_PROFILE.PAC];
  let capability = pac[onfAttributes.STRING_PROFILE.CAPABILITY];
  let enumeration = capability[onfAttributes.STRING_PROFILE.ENUMERATION]

  if (enumeration.includes(newOperationModeValue)) {
    await fileOperation.writeToDatabaseAsync(url, body, false);
    console.log(`Profile "operationMode" changed from "${currentOperationModeValue}" to "${newOperationModeValue}"`);
  } else {
    throw new createHttpError.BadRequest("Value of operationMode is should be Reactive, OFF or Protection.")
  }
}

/**
 * Returns the configured value of the "operationMode" profile
 * @returns {Promise<String>}
 */
exports.getOperationModeProfileStringValue = async function () {
  let profiles = await ProfileCollection.getProfileListForProfileNameAsync(Profile.profileNameEnum.STRING_PROFILE);

  for (let profile of profiles) {
    let pac = profile[onfAttributes.STRING_PROFILE.PAC];
    let capability = pac[onfAttributes.STRING_PROFILE.CAPABILITY];


    if ("operationMode" === capability[onfAttributes.STRING_PROFILE.STRING_NAME]) {
      let configuration = pac[onfAttributes.STRING_PROFILE.CONFIGURATION];
      return configuration[onfAttributes.STRING_PROFILE.STRING_VALUE];
    }
  }

  throw new createHttpError.InternalServerError("OperationMode String profile not found.");
}

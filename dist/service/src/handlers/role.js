/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/database.js":
/*!********************************!*\
  !*** ./src/config/database.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const Sequelize=__webpack_require__(/*! sequelize */ \"sequelize\")\r\nconst {user}=__webpack_require__(/*! ../models/User */ \"./src/models/User.js\")\r\nconst {role}=__webpack_require__(/*! ../models/Role */ \"./src/models/Role.js\")\r\nconst {auth}=__webpack_require__(/*! ../models/Auth */ \"./src/models/Auth.js\")\r\nconst {workspace}=__webpack_require__(/*! ../models/Workspace */ \"./src/models/Workspace.js\")\r\nconst {userWorkspace}=__webpack_require__(/*! ../models/UserWorkspace */ \"./src/models/UserWorkspace.js\")\r\n const pg=__webpack_require__(/*! pg */ \"pg\")\r\nconst sequelize=new Sequelize(\r\n    process.env.DB_NAME,\r\n    process.env.DB_USER,\r\n    process.env.DB_PASSWORD,\r\n    {\r\n        dialect:'postgres',\r\n        dialectModule: pg,\r\n        host:process.env.DB_HSOT,\r\n        port:process.env.DB_PORT,\r\n        logging:console.log,\r\n        query:{raw:true}\r\n    }\r\n)\r\nconst connection={}\r\nconst User=user(sequelize,Sequelize)\r\nconst Role=role(sequelize,Sequelize)\r\nconst Auth=auth(sequelize,Sequelize)\r\nconst Workspace=workspace(sequelize,Sequelize)\r\nconst UserWorkspace=userWorkspace(sequelize,Sequelize)\r\nWorkspace.belongsToMany(User,{through:\"User_Workspace\",as:\"workspaces\",foreignKey:\"workspace_id\"})\r\nUser.belongsToMany(Workspace,{through:\"User_Workspace\",as:\"users\",foreignKey:\"user_id\"})\r\nUser.hasOne(Auth,{foreignKey:'user_id'})\r\nAuth.belongsTo(User,{foreignKey:'user_id'})\r\nRole.hasMany(User,{\r\nforeignKey:\"role_id\"\r\n})\r\nUser.belongsTo(Role,{\r\n    foreignKey:\"role_id\"\r\n})\r\nconst Models={\r\n    User,\r\n    Role,\r\n    Auth,\r\n    Workspace,\r\n    UserWorkspace,\r\n    sequelize\r\n}\r\n\r\nmodule.exports = async () => {\r\n    if (connection.isConnected) {\r\n      console.log('=> Using existing connection.')\r\n      return Models\r\n    }\r\n  \r\n    await sequelize.sync({alter:true})\r\n    await sequelize.authenticate()\r\n    connection.isConnected = true\r\n    console.log('=> Created a new connection.')\r\n    return Models\r\n  }\r\n\n\n//# sourceURL=webpack:///./src/config/database.js?");

/***/ }),

/***/ "./src/handlers/role.js":
/*!******************************!*\
  !*** ./src/handlers/role.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const middy = __webpack_require__(/*! @middy/core */ \"@middy/core\")\r\nconst jsonBodyParser = __webpack_require__(/*! @middy/http-json-body-parser */ \"@middy/http-json-body-parser\")\r\nconst httpErrorHandler = __webpack_require__(/*! @middy/http-error-handler */ \"@middy/http-error-handler\")\r\nconst connectToDatabase=__webpack_require__(/*! ../config/database */ \"./src/config/database.js\")\r\nmodule.exports.addRole=middy(async(event,context)=>{\r\n    try{\r\n      context.callbackWaitsForEmptyEventLoop = false;\r\n      const {Role}=await connectToDatabase()\r\n      const {roleName}=event.body;\r\n      const role= await Role.create({\r\n        role_name:roleName\r\n      },{\r\n        raw:true\r\n      })\r\n      return {\r\n        statusCode: 200,\r\n        body:JSON.stringify({\r\n           message:\"Role created\",\r\n           data:role\r\n        })\r\n      }\r\n    }\r\n    catch(error)\r\n    {\r\n        return {\r\n            statusCode:error.statusCode,\r\n            body:JSON.stringify({\r\n              message:error.message\r\n            })\r\n          }\r\n    }\r\n}).use(jsonBodyParser())\r\n.use(httpErrorHandler())\n\n//# sourceURL=webpack:///./src/handlers/role.js?");

/***/ }),

/***/ "./src/models/Auth.js":
/*!****************************!*\
  !*** ./src/models/Auth.js ***!
  \****************************/
/***/ ((module) => {

eval("module.exports.auth=(sequelize,type)=>{\r\n    return sequelize.define('Auth',{\r\n        auth_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        access_token:{\r\n            type:type.STRING,\r\n            allowNull:false\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Auth.js?");

/***/ }),

/***/ "./src/models/Role.js":
/*!****************************!*\
  !*** ./src/models/Role.js ***!
  \****************************/
/***/ ((module) => {

eval("module.exports.role=(sequelize,type)=>{\r\n    return sequelize.define('Role',{\r\n        role_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        role_name:{\r\n            type:type.ENUM,\r\n             values:['Admin','Member']\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Role.js?");

/***/ }),

/***/ "./src/models/User.js":
/*!****************************!*\
  !*** ./src/models/User.js ***!
  \****************************/
/***/ ((module) => {

eval("\r\nmodule.exports.user=(sequelize,type)=>{\r\n    return sequelize.define('User',\r\n    {\r\n        user_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        first_name:{\r\n            type:type.STRING,\r\n        },\r\n        last_name:{\r\n            type:type.STRING,\r\n        },\r\n        email_id:{\r\n            type:type.STRING,\r\n            allowNull:false,\r\n            unique:true\r\n        },\r\n        profileImageUploaded:{\r\n            type:type.STRING\r\n        },\r\n        isActive:{\r\n            type:type.BOOLEAN,\r\n            defaultValue:true\r\n        },\r\n        password:{\r\n            type:type.STRING,\r\n        },\r\n        active_workspace_id:{\r\n            type:type.INTEGER,\r\n            allowNull:false\r\n        }\r\n\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/User.js?");

/***/ }),

/***/ "./src/models/UserWorkspace.js":
/*!*************************************!*\
  !*** ./src/models/UserWorkspace.js ***!
  \*************************************/
/***/ ((module) => {

eval("module.exports.userWorkspace=(sequelize,type)=>{\r\n    return sequelize.define('User_Workspace',{\r\n        user_id:{\r\n            type:type.INTEGER,\r\n            allowNull:false\r\n        },\r\n        workspace_id:{\r\n          type:type.INTEGER,\r\n          allowNull:false\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/UserWorkspace.js?");

/***/ }),

/***/ "./src/models/Workspace.js":
/*!*********************************!*\
  !*** ./src/models/Workspace.js ***!
  \*********************************/
/***/ ((module) => {

eval("module.exports.workspace=(sequelize,type)=>{\r\n    return sequelize.define('Workspace',{\r\n        workspace_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        workspace_name:{\r\n            type:type.STRING,\r\n            allowNull:false\r\n        },\r\n        email_id:{\r\n            type:type.STRING,\r\n            allowNull:false,\r\n            unique:true\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Workspace.js?");

/***/ }),

/***/ "@middy/core":
/*!******************************!*\
  !*** external "@middy/core" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/core");

/***/ }),

/***/ "@middy/http-error-handler":
/*!********************************************!*\
  !*** external "@middy/http-error-handler" ***!
  \********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/http-error-handler");

/***/ }),

/***/ "@middy/http-json-body-parser":
/*!***********************************************!*\
  !*** external "@middy/http-json-body-parser" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/http-json-body-parser");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("pg");

/***/ }),

/***/ "sequelize":
/*!****************************!*\
  !*** external "sequelize" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("sequelize");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/handlers/role.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/interface-name-prefix */

import { writable } from "svelte/store"
const remote: typeof import("electron").remote = window.require("electron")
  .remote
const path: typeof import("path") = remote.require("path")
const fs: typeof import("fs") = remote.require("fs")
const got: typeof import("got").default = remote.require("got")
const extract: typeof import("extract-zip") = remote.require("extract-zip")
const child_process: typeof import("child_process") = remote.require(
  "child_process"
)
const exec = child_process.execSync
const spawn = child_process.spawn
const util: typeof import("util") = remote.require("util")
const stream: typeof import("stream") = remote.require("stream")
const glob: typeof import("glob") = remote.require("glob")
const microjob: typeof import("microjob") = remote.require("microjob")

// RE-EXPORTS
// -----------------------------------------------
export { remote, path, fs, got, extract, spawn, glob, util, exec, microjob }

// GLOBAL VALUES
// -----------------------------------------------
//

export type page = "index" | "root" | "update"
export const currentPage = writable<page>("index")
export const pageHistory = writable<page[]>(["index"])
export const currentStep = writable<IStep>(undefined)
export const currentSteps = writable<IStep[]>(undefined)
export const imageDirStore = writable<string>(undefined)

export interface IStep {
  id: number
  name: string
  description: string
  component: unknown
}

export function navigate(page: page): void {
  currentPage.set(page)
  pageHistory.update((value) => {
    if (page !== value[value.length - 1]) {
      value.push(page)
    }
    return value
  })
}

export function nextStep() {
  let stepsValue: IStep[]
  currentStep.update((value) => {
    currentSteps.subscribe((value) => {
      stepsValue = value
    })()
    return stepsValue[stepsValue.findIndex((item) => item === value) + 1]
  })
}

export const DIR = path.join(remote.app.getPath("cache"), "symbit")
export const LOG_DIR = path.join(DIR, ".logs")
export const LOG_PATH = path.join(LOG_DIR, `symbit.log`)
export const PLATFORM_TOOLS_DIR = path.join(DIR, "platform-tools")
export const MAGISK_MANAGER_APK_PATH = path.join(DIR, "magisk-manager.apk")

export enum SUPPORTED_DEVICE_TYPES {
  GOOGLE_PIXEL = "Google Pixel",
  ONEPLUS = "OnePlus",
}

export type platformToolsVariants = "windows" | "linux" | "darwin"

export enum ACTIONS {
  UPDATE = "update",
  ROOT = "root",
}

/**
 * # Indented Documents
 *
 * Template literal function to generate unindented strings
 *
 * @example
 * indoc`
 *   test
 * `
 * // output: `test`
 */
export function indoc(document: TemplateStringsArray): string {
  // console.log(document[0].split("\n"));
  return document[0]
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join("\n")
}

export const STRINGS = {
  unsupported_device: "Unfortunately your device has not been supported yet 😕",

  enable_developer_options: indoc`
    1. Go to settings > about phone
    2. Tap "build number" 7 times
  `,

  enable_usb_debugging: indoc`
    1. Go to the Developer Options menu
    2. Scroll down to find "USB Debugging"
    3. Flip the switch and you're good to go!
  `,

  enable_oem_unlocking: indoc`
    Instructions:
    1. Go to the Developer Options menu
    2. Scroll down to find "OEM Unlocking"
    3. Flip the switch and you're good to go!
  `,

  adb_always_allow: indoc`
    Please check the 'always allow' option for ADB
    if you see a popup asking you to allow this PC to connect with ADB.
  `,

  patch_boot_image_file_instructions: indoc`
    1. Open Magisk
    2. Tap 'install'
    3. Tap 'install' again
    4. Tap 'Select and Patch a File'
    5. Go to the root of your Pixel's file manager and select the boot.img file
  `,

  install_python_instructions: indoc`
    You'll need to install Python on your system. Get it here:
    https://www.python.org/downloads/
    If you are using Linux, you know what to do 😉
  `,

  magisk_canary_instructions: indoc`
    You can install Magisk Canary by:
    1. Updating your existing Magisk to the canary channel (recommended)
    2. Installing the canary version of Magisk Manager
  `,

  magisk_canary_instructions_update_existing: indoc`
    To move your existing installation to the Canary channel,
    1. Open Magisk Manager
    2. Go to the settings page
    3. Scroll down and tap on "Update Channel"
    4. Tap "Custom Channel"
    5. In the input box, type https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/debug.json
  `,

  magisk_canary_instructions_install_new: indoc`
    You can install the canary version of Magisk here:
    https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/app-debug.apk
  `,
}

// HELPER FUNCTIONS
// ------------------------------------------
//

export class Log {
  private static getTime() {
    const date = new Date()
    return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`
  }
  private static async logFile(_: unknown) {
    fs.appendFile(LOG_PATH, `${String(_)}\n`, (err) => {
      if (err) throw err
    })
  }
  static d(_: unknown) {
    const message = `${this.getTime()} [debug] ${_}`
    this.logFile(message)
    console.log(message)
  }
  static i(_: unknown) {
    const message = `${this.getTime()} [info] ${_}`
    this.logFile(message)
    console.log(message)
  }
  static w(_: unknown) {
    const message = `${this.getTime()} [warning] ${_}`
    this.logFile(message)
    console.log(message)
  }
  static e(_: unknown) {
    const message = `${this.getTime()} [ERROR] ${_}`
    this.logFile(message)
    console.log(message)
  }
  static f(_: unknown) {
    const message = `${this.getTime()} [FATAL] ${_}`
    this.logFile(message)
    console.log(message)
  }
}

/**
 * Throws an error to the user
 */
export function printError(message: string) {
  console.log(message)
  process.exit(1)
}

/**
 * Ask for input from the user
 */
// export async function input(message: string): Promise<string> {
//   const { response } = await inquirer.prompt([
//     { type: "input", name: "response", message: message },
//   ]);

//   return response;
// }

/**
 * Ask for input from the user
 */
// export async function inputConfirmation(message: string): Promise<boolean> {
//   const { confirmation } = await inquirer.prompt([
//     { type: "confirm", name: "confirmation", message: message },
//   ]);

//   return confirmation;
// }

/**
 * Ask for input from the user
 */
// export async function inputChoice(
//   message: string,
//   choices: string[]
// ): Promise<string> {
//   const { choice } = await inquirer.prompt([
//     { type: "list", name: "choice", message: message, choices: choices },
//   ]);

//   return choice;
// }

export const pipeline = util.promisify(stream.pipeline)

/**
 * Run command on the shell
 *
 * @returns {string} The command output
 */
export function shellExec(...command: string[]): string {
  try {
    const output = exec(command.join(" ")).toString()
    Log.i(output)
    return output
  } catch (e) {
    Log.e(e.message)
  }
}

/**
 * Run ADB on the shell
 */
export function adb(...command: string[]): string {
  if (process.platform === "win32")
    return shellExec(`${PLATFORM_TOOLS_DIR}\\adb.exe ${command.join(" ")}`)
  else if (process.platform === "linux" || process.platform === "darwin")
    return shellExec(`${PLATFORM_TOOLS_DIR}/adb ${command.join(" ")}`)
}

/**
 * Run Fastboot on the shell
 */
export function fastboot(...command: string[]): string {
  if (process.platform === "win32")
    return shellExec(`${PLATFORM_TOOLS_DIR}\\fastboot.exe ${command.join(" ")}`)
  else if (process.platform === "linux" || process.platform === "darwin")
    return shellExec(`${PLATFORM_TOOLS_DIR}/fastboot ${command.join(" ")}`)
}

/**
 * Run chmod on the shell
 */
export function chmod(mode: string, ...files: string[]) {
  if (process.platform === "linux" || process.platform === "darwin")
    shellExec(`chmod ${mode} ${files.join(" ")}`)
}

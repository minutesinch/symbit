import ora from "ora";
import chalk from "chalk";
import shell from "shelljs";
import inquirer from "inquirer";
import os from "os";

// GLOBAL VALUES
// -----------------------------------------------
//

export const DIR = os.tmpdir();
export const PLATFORM_TOOLS_DIR = `${DIR}/platform-tools`;
export const MAGISK_MANAGER_APK_PATH = `${DIR}/magisk-manager.apk`;
export const spinner = ora();

export enum SUPPORTED_DEVICE_TYPES {
  GOOGLE_PIXEL = "Google Pixel",
  ONEPLUS = "OnePlus",
}

export enum ACTIONS {
  UPDATE = "update",
  ROOT = "root",
}

export const STRINGS = {
  unsupported_device: "Unfortunately your device has not been supported yet 😕",

  enable_developer_options: indoc`
    Instructions for enabling Developer Options
    ---

    1. Go to settings > about phone
    2. Tap "build number" 7 times
  `,

  enable_usb_debugging: indoc`
    Instructions for enabling USB debugging
    ---

    1. Go to the Developer Options menu
    2. Scroll down to find "USB Debugging"
    3. Flip the switch and you're good to go!
  `,

  enable_oem_unlocking: indoc`
    Instructions for enabling OEM unlocking
    ---

    1. Go to the Developer Options menu
    2. Scroll down to find "OEM Unlocking"
    3. Flip the switch and you're good to go!
  `,

  adb_always_allow: indoc`
    Please check the 'always allow' option for ADB
    if you see a popup asking you to allow this PC to connect with ADB.
  `,

  tip_drag_folder_into_terminal: indoc`TIP: You can drag and drop the folder into the terminal`,

  patch_boot_image_file_instructions: indoc`
    Now you'll need to patch the boot image file using the Magisk Manager app
    on your Android device.
    
    1. Open Magisk
    2. Tap 'install'
    3. Tap 'install' again
    4. Tap 'Select and Patch a File'
    5. Go to the root of your Pixel's file manager
       and select the boot.img file
    NOTE: After patching the boot.img, DO NOT REBOOT.
  `,

  install_python_instructions: indoc`
    You'll need to install Python on your system. Get it here:
    https://www.python.org/downloads/

    If you are using Linux, you know what to do 😉
  `,
};

// HELPER FUNCTIONS
// ------------------------------------------
//

export function print(_: string) {
  process.stdout.write(_ + "\n");
}

export class Log {
  private static getTime() {
    const date = new Date();
    return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
  }
  static d(_: unknown) {
    console.log(
      chalk.grey(
        `${this.getTime()} [${chalk.blue("debug")}] ${chalk.whiteBright(_)}`
      )
    );
  }
  static i(_: unknown) {
    console.log(
      chalk.grey(
        `${this.getTime()} [${chalk.whiteBright(
          chalk.bold("info")
        )}] ${chalk.whiteBright(_)}`
      )
    );
  }
  static w(_: unknown) {
    console.log(
      chalk.grey(
        `${this.getTime()} [${chalk.yellow("warning")}] ${chalk.whiteBright(_)}`
      )
    );
  }
  static e(_: unknown) {
    console.log(
      chalk.grey(
        `${this.getTime()} [${chalk.redBright("error")}] ${chalk.whiteBright(
          _
        )}`
      )
    );
  }
  static f(_: unknown) {
    console.log(
      chalk.grey(
        `${this.getTime()} [${chalk.bold(
          chalk.redBright("fatal")
        )}] ${chalk.redBright(_)}`
      )
    );
  }
}

/**
 * Throws an error to the user
 */
export function printError(message: string) {
  console.log(chalk.redBright(message));
  process.exit(1);
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
    .join("\n");
}

/**
 * Ask for input from the user
 */
export async function input(message: string): Promise<string> {
  const { response } = await inquirer.prompt([
    { type: "input", name: "response", message: message },
  ]);

  return response;
}

/**
 * Ask for input from the user
 */
export async function inputConfirmation(message: string): Promise<boolean> {
  const { confirmation } = await inquirer.prompt([
    { type: "confirm", name: "confirmation", message: message },
  ]);

  return confirmation;
}

/**
 * Ask for input from the user
 */
export async function inputChoice(
  message: string,
  choices: string[]
): Promise<string> {
  const { choice } = await inquirer.prompt([
    { type: "list", name: "choice", message: message, choices: choices },
  ]);

  return choice;
}

/**
 * Run ADB on the shell
 */
export function adb(...command: string[]) {
  shell.exec(`./${PLATFORM_TOOLS_DIR}/adb ${command.join(" ")}`);
}

/**
 * Run Fastboot on the shell
 */
export function fastboot(...command: string[]) {
  shell.exec(`./${PLATFORM_TOOLS_DIR}/fastboot ${command.join(" ")}`);
}
#!/usr/bin/env node

import program from 'commander'

import { packageNxWidget, ArgsEnum, argDefaults, CliArguments, argDescriptions } from './index'

Object.entries(ArgsEnum).reduce((programRef, [short, long]) => programRef.option(`-${short} --${long} <value>`, argDescriptions[long],argDefaults[long]), program.version('0.1.0')).parse(process.argv)

const pickedArgs: CliArguments = Object.values(ArgsEnum).reduce((args, long) => ({ ...args, [long]: program[long] }), {} as any)

packageNxWidget(pickedArgs).then(result => console.log(result.message))

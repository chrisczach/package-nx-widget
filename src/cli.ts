#!/usr/bin/env node

import { Command } from 'commander'

import { packageNxWidget, ArgsEnum, argDefaults, CliArguments, argDescriptions } from './index'

const program = new Command();

Object.entries(ArgsEnum).reduce((programRef, [short, long]) => programRef.option(`-${short} --${long} <value>`, argDescriptions[long], argDefaults[long]), program.version('0.1.0')).parse(process.argv)

packageNxWidget(program.opts() as CliArguments).then(result => console.log(result.message))

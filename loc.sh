#!/bin/bash
wc -l \
	vocodes/src/*css \
	vocodes/src/*ts* \
	vocodes/src/*/*ts* \
	vocodes/src/*/*/*ts* \
	vocodes/src/*/*/*/*ts* \
	vocodes/src/*/*/*/*/*ts* \
	vocodes/src/*/*/*/*/*/*ts* \
	| sort -n

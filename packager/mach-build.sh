#!/bin/bash
declare -a ACTION=$1

# Where to copy the downloaded sources 
OUTPUT=./build-mach

#Trustedbird patch sources
TRUSTEDBIRD_SRC=../trustedbird-patch-source-24

THUNDERBIRD_ARCHIVE=./thunderbird-24.3.0.source.tar.bz2

#Mozilla mercurial repository (default to http://hg.mozilla.org/comm-central)
HG_REP=https://hg.mozilla.org/releases/comm-release

# Specific branch or tag name (leave empty for a trunk build)
HG_BRANCH=RELEASE_24_END

if [ -z "$ACTION" ]
then
	echo "usage: mach-build.sh [reset | clean | hg | extract | patch | build | package ]"
	exit
fi

#Clone or pull Mozilla-central
if [ ! -d "$OUTPUT" ]; then mkdir $OUTPUT; fi

if [ ${ACTION} == "reset" ]
then
	echo "Delete output folder: $OUTPUT"
	rm -rf $OUTPUT
fi

if [ ${ACTION} == "clean" ]
then
	echo "Clean object files: $OUTPUT"
	pushd $OUTPUT
	./mozilla/mach clobber || exit $?
	popd
fi

if [ ${ACTION} == "hg" ]
then
	if [ "$(ls -A $OUTPUT)" ]; then 
		echo "Pulling changes since last build"
		pushd $OUTPUT
		hg pull --verbose
		popd 
	else
		echo "Cloning Mozilla repository"
		pushd $OUTPUT
		hg --verbose clone $HG_REP . || exit $?
		#pushd comm-central
		python client.py checkout
		if [ -z "$HG_BRANCH" ]; then
			#Get given branch
			hg --verbose up $HG_BRANCH || exit $?
		fi
		#popd
		popd
	fi
fi

if [ ${ACTION} == "extract" ]
then
	tar xvjf ${THUNDERBIRD_ARCHIVE} -C $OUTPUT --strip-components=1
fi


#Patch Trustedbird sources
if [ ${ACTION} == "patch" ]
then
	echo "Patching Trustedbird sources"
	cp -avT $TRUSTEDBIRD_SRC $OUTPUT/.
fi

#Launch build
if [ ${ACTION} == "build" ]
then
	echo "Launch build"
	pushd $OUTPUT
	./mozilla/mach build || exit $?
	popd
fi

#Launch build
#if [ ${ACTION} == "package" ]
#then
#	echo "Build installer"
#	pushd $OUTPUT/mozilla
#	./mach build package || exit $?
#	popd
#fi

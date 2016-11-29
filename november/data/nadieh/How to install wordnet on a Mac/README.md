##General instructions in INSTALL

The simplest way to compile this package is:

  1. `cd' to the directory containing the package's source code and type
     `./configure' to configure the package for your system.  If you're
     using `csh' on an old version of System V, you might need to type
     `sh ./configure' instead to prevent `csh' from trying to execute
     `configure' itself.

     Running `configure' takes awhile.  While running, it prints some
     messages telling which features it is checking for.

  2. Type `make' to compile the package.

  3. Type `make install' to install the programs and any data files and
     documentation.

  4. You can remove the program binaries and object files from the
     source code directory by typing `make clean'.  To also remove the
     files that `configure' created (so you can compile the package for
     a different kind of computer), type `make distclean'.  There is
     also a `make maintainer-clean' target, but that is intended mainly
     for the package's developers.  If you use it, you may have to get
     all sorts of other programs in order to regenerate files that came
     with the distribution.
	 
+++++++++++++++++++++++++++++++++++++++++++++++++

##What I had to do to get Wordnet working

Of course that didn't work straight away, I had to do the following things as well

Had to install XCode and ran to get gcc (I ran gcc --version and apperantly I didn't have it yet)
sudo xcode-select --install
sudo xcode-select -switch /Library/Developer/CommandLineTools/
http://apple.stackexchange.com/questions/209624/how-to-fix-homebrew-error-invalid-active-developer-path-after-upgrade-to-os-x

Had to install XQuartz and do
sudo ln -s /opt/X11/include/X11 /usr/local/include/X11
to get rid of the error that there was no "X11/Xlib.h"
http://stackoverflow.com/questions/14321038/x11-xlib-h-no-such-file-or-directory-on-mac-os-x-mountain-lion

Had to follow the advice here and change all interp->result in the stubs.c to the thing in this stackOverflow question (I got about 10 errors when running make) - I placed the altered stubs.c file in this folder
http://stackoverflow.com/questions/23658393/installing-wordnet-on-mac-10-9-2#

Then I installed the wordnet package in R, loaded it (no errors or questions about where to find the dictionary), ran 
synonyms("company", "NOUN")
And got results! YAY!
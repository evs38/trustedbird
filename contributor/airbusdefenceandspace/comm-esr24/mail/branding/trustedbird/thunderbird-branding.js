/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Default start page
pref("mailnews.start_page.url","");

// first launch welcome page
pref("mailnews.start_page.welcome_url","");

// start page override to load after an update
pref("mailnews.start_page.override_url","");

// Interval: Time between checks for a new version (in seconds)
// nightly=8 hours, official=24 hours
pref("app.update.interval", 28800);

// The time interval between the downloading of mar file chunks in the
// background (in seconds)
pref("app.update.download.backgroundInterval", 60);

// Give the user x seconds to react before showing the big UI. nightly=1 hour
pref("app.update.promptWaitTime", 3600);

pref("app.vendorURL", "");

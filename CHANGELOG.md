# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2020-04-02

## Changed
- use numeric decomposition of outcome value to enable covering large range of outcome with minimal number of CETs

## Fixed
- validate for empty passphrase when changing it through the configuration menu


## [0.2.0] - 2020-26-10

### Added
- Ability to connect to Bitcoin core node through Tor (in particular for BTCPay server users).

### Changed
- Use adaptor signatures based DLC protocol instead of punishment based one.

### Fixed
- Improved server reconnection.
- Fix bug when no remote collateral is set.

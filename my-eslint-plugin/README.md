# eslint-plugin-my-eslint-plugin

Disallow numbers in variable names

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-my-eslint-plugin`:

```
$ npm install eslint-plugin-my-eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-my-eslint-plugin` globally.

## Usage

Add `my-eslint-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "my-eslint-plugin"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "my-eslint-plugin/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here






#!/usr/bin/env python3
"""
Convert TruffleHog JSON results to SARIF format for GitHub Security tab integration.
"""

import json
import sys
import os
from pathlib import Path


def convert_to_sarif(trufflehog_results):
    """Convert TruffleHog JSON results to SARIF format."""
    sarif = {
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "version": "2.1.0",
        "runs": [{
            "tool": {
                "driver": {
                    "name": "TruffleHog",
                    "version": "3.90.8",
                    "informationUri": "https://github.com/trufflesecurity/trufflehog",
                    "rules": []
                }
            },
            "results": []
        }]
    }

    # Track unique detector types for rules
    detector_types = set()

    for finding in trufflehog_results:
        detector_type = finding.get('DetectorType', 'Unknown')
        detector_types.add(detector_type)

        # Extract file information
        source_metadata = finding.get('SourceMetadata', {})
        data = source_metadata.get('Data', {})
        filesystem = data.get('Filesystem', {})

        file_path = filesystem.get('file', 'unknown')
        line_number = filesystem.get('line', 1)

        # Create SARIF result
        result = {
            "ruleId": detector_type,
            "ruleIndex": 0,  # Will be updated later
            "message": {
                "text": f"Potential {detector_type} secret detected",
                "markdown": f"**{detector_type}** secret detected. Please review and remove if this is a real credential."
            },
            "level": "error",
            "locations": [{
                "physicalLocation": {
                    "artifactLocation": {
                        "uri": file_path,
                        "uriBaseId": "SRCROOT"
                    },
                    "region": {
                        "startLine": line_number,
                        "startColumn": 1
                    }
                }
            }],
            "partialFingerprints": {
                "primaryLocationLineHash": f"{detector_type}:{file_path}:{line_number}"
            }
        }

        # Add verification status if available
        if 'Verified' in finding:
            result['properties'] = {
                'verified': finding['Verified']
            }

        sarif["runs"][0]["results"].append(result)

    # Add rules for each detector type
    for i, detector_type in enumerate(sorted(detector_types)):
        rule = {
            "id": detector_type,
            "name": f"{detector_type}SecretDetection",
            "shortDescription": {
                "text": f"Detects {detector_type} secrets"
            },
            "fullDescription": {
                "text": f"This rule detects potential {detector_type} secrets in the codebase."
            },
            "defaultConfiguration": {
                "level": "error"
            },
            "help": {
                "text": f"Remove the {detector_type} secret and rotate the credential if it's valid.",
                "markdown": f"## {detector_type} Secret Detected\n\nA potential {detector_type} secret was found. If this is a real credential:\n\n1. Remove it from your code\n2. Rotate the credential\n3. Use environment variables or secure secret management instead"
            }
        }
        sarif["runs"][0]["tool"]["driver"]["rules"].append(rule)

        # Update ruleIndex for all results with this detector type
        for result in sarif["runs"][0]["results"]:
            if result["ruleId"] == detector_type:
                result["ruleIndex"] = i

    return sarif


def main():
    """Main function to handle command line execution."""
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else 'trufflehog.sarif'
    else:
        input_file = 'results/trufflehog-results.json'
        output_file = 'results/trufflehog.sarif'

    try:
        # Check if input file exists
        if not os.path.exists(input_file):
            print(f"Error: Input file '{input_file}' not found")
            sys.exit(1)

        # Load TruffleHog results
        with open(input_file, 'r') as f:
            results = json.load(f)

        if not isinstance(results, list):
            print("Error: Expected JSON array of results")
            sys.exit(1)

        # Convert to SARIF
        sarif_output = convert_to_sarif(results)

        # Ensure output directory exists
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)

        # Write SARIF output
        with open(output_file, 'w') as f:
            json.dump(sarif_output, f, indent=2)

        print(f"✅ Successfully converted {len(results)} findings to SARIF format")
        print(f"📄 Output written to: {output_file}")

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in input file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error converting to SARIF: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

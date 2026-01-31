# Extension Documentation

Technical documentation for the Jira Boost browser extension.

## Contents

### Architecture & Design

- **[template-field-configuration.md](./template-field-configuration.md)**  
  Complete design doc for the template wizard field configuration system.  
  Covers: 3-way mode toggle, unified option model, validation strategy, trade-offs.

- **[template-field-quick-reference.md](./template-field-quick-reference.md)**  
  Quick lookup guide for developers working with field configurations.  
  Covers: Type definitions, common patterns, troubleshooting, examples.

### Development Tools

- **[react-devtools.md](./react-devtools.md)**  
  Instructions for debugging React components in the extension.

## Related Documentation

### Project-Level Specs

- **[Fast Track Issue Template RFC](../../../specs/Fast%20Track%20Issue%20Template%20RFC.md)**  
  Original RFC with architecture, data model, and implementation plan.  
  Section 8 documents the design evolution and final implementation.

- **[Fast Track Issue Template PRD](../../../specs/Fast%20Track%20Issue%20Template%20PRD.md)**  
  Product requirements and user stories.

### Template System Quick Nav

| Topic | Document | Section |
|-------|----------|---------|
| **Why 3-way toggle?** | [template-field-configuration.md](./template-field-configuration.md) | Design Philosophy |
| **Type definitions** | [template-field-quick-reference.md](./template-field-quick-reference.md) | Type Definitions |
| **Validation rules** | [template-field-configuration.md](./template-field-configuration.md) | Validation Strategy |
| **Adding a field** | [template-field-quick-reference.md](./template-field-quick-reference.md) | Common Patterns |
| **User-defined options** | [template-field-configuration.md](./template-field-configuration.md) | Unified Field Option Model |
| **Future roadmap** | [template-field-configuration.md](./template-field-configuration.md) | Future Considerations |

## Contributing

When adding new features or changing existing behavior:

1. **Update relevant design docs** if the change affects architecture or user-facing behavior
2. **Add examples** to the quick reference if introducing new patterns
3. **Document trade-offs** in the design doc if choosing between alternatives
4. **Update this README** if adding new documentation files

## Questions?

- **Implementation details?** Check the quick reference first
- **Design rationale?** See the full design doc
- **High-level architecture?** Read the RFC
- **Still stuck?** Search the codebase or ask the team

---

**Last updated:** 2025-01-31

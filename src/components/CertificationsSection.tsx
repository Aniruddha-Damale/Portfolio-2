import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Check, Copy, Download, Eye, FileText, Plus, X } from 'lucide-react';
import type { CertificateData } from '../types/portfolio.ts';
import { isValidSafeHref } from '../lib/icons.tsx';
import {
  AnimatedCopyButton,
  EditorialHeading,
  MagneticWrap,
  SectionReveal,
  TiltCard,
} from './TechfestEffects.tsx';

interface CertificationsSectionProps {
  certificates: CertificateData[];
  isAdmin: boolean;
  editMode: boolean;
  ribbon: React.ReactNode;
  dimmedClass: string;
  onOpenAdminCertificates: () => void;
}

export function CertificationsSection({
  certificates,
  isAdmin,
  editMode,
  ribbon,
  dimmedClass,
  onOpenAdminCertificates,
}: CertificationsSectionProps) {
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<number | null>(null);
  const [copiedModalId, setCopiedModalId] = useState(false);

  const items = editMode ? certificates : certificates.filter((c) => c.isVisible);

  useEffect(() => {
    if (!selectedCert) return;
    setCopiedModalId(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCert]);

  const copyText = async (value: string, onSuccess: () => void) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onSuccess();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        onSuccess();
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleCardCopyId = (cert: CertificateData) => {
    void copyText(cert.credentialId, () => {
      setCopiedCardId(cert.id);
      window.setTimeout(() => {
        setCopiedCardId((curr) => (curr === cert.id ? null : curr));
      }, 2000);
    });
  };

  const handleModalCopyId = (cert: CertificateData) => {
    void copyText(cert.credentialId, () => {
      setCopiedModalId(true);
      window.setTimeout(() => setCopiedModalId(false), 2200);
    });
  };

  return (
    <>
      <section
        id="certificates"
        className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
      >
        {ribbon}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <SectionReveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                VERIFIED CREDENTIALS &amp; INTERNSHIPS
              </p>
              <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                <EditorialHeading
                  text="Industry Certifications & Specialized Training"
                  italicWord="Certifications"
                />
              </h2>
            </div>

            {editMode && isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminCertificates}
                className="swiss-pill-btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Manage Credentials
              </button>
            )}
          </SectionReveal>

          {items.length === 0 ? (
            <div className="mt-10 p-10 rounded-[2px] border border-[#1e1e1e]/12 bg-transparent text-center">
              <Award className="w-8 h-8 mx-auto text-[#838282]" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-normal text-[#838282]">
                No certifications published yet.
                {isAdmin ? ' Add or upload credentials in the Certificates Manager.' : ''}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
              {items.map((cert, idx) => {
                const hasVerificationLink = isValidSafeHref(cert.verificationUrl);
                const isCopied = copiedCardId === cert.id;
                const verifyLabel = cert.actionLabel || 'Verify Credential';
                const indexLabel = String(idx + 1).padStart(2, '0');

                return (
                  <TiltCard
                    key={cert.id}
                    interactiveCursor
                    revealDelay={idx * 0.08}
                    className={`group swiss-card flex flex-col ${
                      !cert.isVisible ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      {/* Top Row: 64x64px rotating geometric index box + Metadata */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                            {cert.badgeType || 'CERTIFICATION'}
                          </p>
                          {cert.issueDate && (
                            <p className="text-xs font-mono tabular-nums text-[#838282]">
                              {cert.issueDate}
                            </p>
                          )}
                        </div>

                        <div className="swiss-icon-box text-[#111111]">
                          <span className="font-display font-bold text-lg tracking-[-0.04em] tabular-nums">
                            {indexLabel}
                          </span>
                        </div>
                      </div>

                      {/* Title & Issuer */}
                      <h3 className="mt-6 text-2xl sm:text-[26px] font-display font-bold tracking-[-0.04em] leading-[1.05] text-[#111111]">
                        {cert.title}
                      </h3>

                      <p className="mt-2 text-sm font-medium text-[#838282] leading-snug">
                        {cert.issuer}
                      </p>

                      {/* Description */}
                      {cert.description && (
                        <p className="mt-4 text-sm font-normal text-[#111111]/80 leading-relaxed">
                          {cert.description}
                        </p>
                      )}

                      {/* Credential ID & Optional Score Breakdown */}
                      {(cert.credentialId || cert.scoreBreakdown) && (
                        <div className="mt-5 pt-4 border-t border-[#1e1e1e]/12 space-y-2.5 text-xs">
                          {cert.credentialId && (
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="font-bold uppercase tracking-[0.08em] text-[#838282]">
                                  {cert.credentialIdLabel || 'Credential ID'}:
                                </span>
                                <span className="font-mono font-medium text-[#111111] tabular-nums break-all">
                                  {cert.credentialId}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCardCopyId(cert)}
                                aria-label={`Copy ${cert.credentialIdLabel || 'Credential ID'} for ${cert.title}`}
                                title="Copy Credential ID"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#1e1e1e]/20 text-[11px] font-bold uppercase tracking-[0.06em] text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] hover:border-[#1e1e1e] transition-colors shrink-0 whitespace-nowrap"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3" strokeWidth={1.5} />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                                    <span>Copy ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {cert.scoreBreakdown && (
                            <p className="font-mono text-[11.5px] leading-relaxed text-[#111111]/80 tabular-nums">
                              <span className="font-bold uppercase tracking-[0.08em] text-[#838282]">
                                Score:{' '}
                              </span>
                              {cert.scoreBreakdown}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Clean Unboxed Skill Metadata Line */}
                      {cert.skillTags && cert.skillTags.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-[#1e1e1e]/10">
                          <p className="text-xs font-mono text-[#838282] leading-relaxed">
                            {cert.skillTags.join('  /  ')}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
                        <MagneticWrap>
                          <button
                            type="button"
                            onClick={() => setSelectedCert(cert)}
                            className="swiss-pill-btn group/btn inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Preview Certificate</span>
                          </button>
                        </MagneticWrap>

                        {hasVerificationLink && (
                          <MagneticWrap>
                            <a
                              href={cert.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="swiss-pill-btn-solid group/verify inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
                            >
                              <span>{verifyLabel}</span>
                              <span
                                aria-hidden="true"
                                className="transition-transform duration-150 group-hover/verify:translate-x-0.5"
                              >
                                →
                              </span>
                            </a>
                          </MagneticWrap>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Swiss Monochrome Certificate Lightbox Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            key="cert-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-[#111111]/65 backdrop-blur-xs p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
          >
            <motion.div
              key="cert-lightbox-panel"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#f2f2f2] border border-[#1e1e1e] rounded-[2px] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1e1e1e]/12">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                    <span>{selectedCert.badgeType || 'VERIFIED CREDENTIAL'}</span>
                    {selectedCert.issueDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-normal">
                          {selectedCert.issueDate}
                        </span>
                      </>
                    )}
                  </div>
                  <h3
                    id="cert-modal-title"
                    className="mt-2 text-2xl sm:text-3xl swiss-heading uppercase text-[#111111]"
                  >
                    {selectedCert.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-[#838282]">
                    {selectedCert.issuer}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate preview"
                  className="w-10 h-10 rounded-full border border-[#1e1e1e]/25 text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] hover:border-[#1e1e1e] inline-flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Credential ID + One-Click Copy Bar */}
              {(selectedCert.credentialId || selectedCert.scoreBreakdown) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-[2px] bg-white border border-[#1e1e1e]/15">
                  <div className="space-y-1 min-w-0">
                    {selectedCert.credentialId && (
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm font-mono">
                        <span className="font-sans font-bold uppercase tracking-[0.08em] text-[#838282] text-[11px]">
                          {selectedCert.credentialIdLabel || 'Credential ID'}:
                        </span>
                        <span className="font-medium text-[#111111] tabular-nums break-all select-all">
                          {selectedCert.credentialId}
                        </span>
                      </div>
                    )}
                    {selectedCert.scoreBreakdown && (
                      <p className="text-xs font-mono text-[#838282] tabular-nums">
                        {selectedCert.scoreBreakdown}
                      </p>
                    )}
                  </div>

                  {selectedCert.credentialId && (
                    <AnimatedCopyButton
                      copied={copiedModalId}
                      onClick={() => handleModalCopyId(selectedCert)}
                      label="Copy Credential ID"
                      copiedLabel="Credential ID Copied"
                    />
                  )}
                </div>
              )}

              {/* Embedded PDF / Image Preview */}
              <div>
                {selectedCert.fileUrl ? (
                  selectedCert.fileType === 'pdf' ? (
                    <div className="rounded-[2px] overflow-hidden border border-[#1e1e1e]/20 bg-white">
                      <div className="h-[420px] sm:h-[500px] w-full bg-white">
                        <iframe
                          src={`${selectedCert.fileUrl}#view=FitH`}
                          title={`${selectedCert.title} PDF Preview`}
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="px-4 py-2.5 bg-[#f2f2f2] border-t border-[#1e1e1e]/12 flex flex-wrap items-center justify-between gap-2 text-xs text-[#838282]">
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <FileText className="w-3.5 h-3.5 text-[#111111]" strokeWidth={1.5} />
                          <span>Verified PDF Document</span>
                        </span>
                        <a
                          href={selectedCert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#838282] transition-colors whitespace-nowrap"
                        >
                          <span>Open Full PDF in New Tab</span>
                          <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[2px] overflow-hidden border border-[#1e1e1e]/20 bg-white">
                      <img
                        src={selectedCert.fileUrl}
                        alt={selectedCert.title}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-[500px] object-contain mx-auto"
                      />
                    </div>
                  )
                ) : (
                  <div className="p-10 rounded-[2px] bg-white border border-[#1e1e1e]/12 text-center text-sm text-[#838282]">
                    No preview document attached to this credential yet.
                  </div>
                )}
              </div>

              {/* Description & Skills */}
              {(selectedCert.description ||
                (selectedCert.skillTags && selectedCert.skillTags.length > 0)) && (
                <div className="space-y-2">
                  {selectedCert.description && (
                    <p className="text-sm font-normal text-[#111111]/85 leading-relaxed">
                      {selectedCert.description}
                    </p>
                  )}
                  {selectedCert.skillTags && selectedCert.skillTags.length > 0 && (
                    <p className="text-xs font-mono text-[#838282]">
                      {selectedCert.skillTags.join('  /  ')}
                    </p>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1e1e1e]/12">
                {selectedCert.fileUrl && (
                  <a
                    href={
                      selectedCert.fileUrl.startsWith('/api/files/')
                        ? `${selectedCert.fileUrl}?download=1`
                        : selectedCert.fileUrl
                    }
                    download
                    className="swiss-pill-btn-solid inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Download Certificate</span>
                  </a>
                )}

                {isValidSafeHref(selectedCert.verificationUrl) && (
                  <a
                    href={selectedCert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="swiss-pill-btn inline-flex items-center gap-1.5 px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
                  >
                    <span>{selectedCert.actionLabel || 'Verify Credential'}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="ml-auto px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#838282] hover:text-[#111111] transition-colors whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

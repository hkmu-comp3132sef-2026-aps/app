import type { Router } from "expo-router";

import type { Maybe, School, SchoolLang } from "#/graphql";
import type { Colors } from "#/hooks/colors";

import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import * as React from "react";
import { useIntlayer } from "react-intlayer";
import { ScrollView, type ViewStyle } from "react-native";
import styled from "styled-components/native";

import { Blank } from "#/components/blank";
import { useQuery } from "#/graphql";
import { useColors } from "#/hooks/colors";
import { useSchoolLang } from "#/hooks/school-lang";

type SchoolFieldKey = Exclude<
    keyof School,
    "__typename" | "name" | "school_id"
>;

type SchoolField = {
    key: SchoolFieldKey;
    labelKey: SchoolFieldLabelKey;
};

type SchoolSection = {
    titleKey: SchoolSectionTitleKey;
    fields: readonly SchoolField[];
};

type RenderedField = {
    key: SchoolFieldKey;
    label: string;
    value: string;
};

type SchoolSectionTitleKey = "profile" | "contact" | "coordinates";

type SchoolFieldLabelKey =
    | "category"
    | "level"
    | "district"
    | "financeType"
    | "session"
    | "studentsGender"
    | "language"
    | "address"
    | "telephone"
    | "fax"
    | "latitude"
    | "longitude"
    | "easting"
    | "northing";

const SCHOOL_SECTIONS = [
    {
        titleKey: "profile",
        fields: [
            {
                key: "category",
                labelKey: "category",
            },
            {
                key: "level",
                labelKey: "level",
            },
            {
                key: "district",
                labelKey: "district",
            },
            {
                key: "finance_type",
                labelKey: "financeType",
            },
            {
                key: "session",
                labelKey: "session",
            },
            {
                key: "students_gender",
                labelKey: "studentsGender",
            },
        ],
    },
    {
        titleKey: "contact",
        fields: [
            {
                key: "address",
                labelKey: "address",
            },
            {
                key: "telephone",
                labelKey: "telephone",
            },
            {
                key: "fax",
                labelKey: "fax",
            },
        ],
    },
] as const satisfies readonly SchoolSection[];

const getSchoolIdParam = (
    id: string | string[] | undefined,
): string | undefined => {
    if (Array.isArray(id)) return id[0];

    return id;
};

const formatFieldValue = (
    value: Maybe<string> | Maybe<number> | undefined,
): string | null => {
    if (typeof value === "number") {
        return new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 6,
        }).format(value);
    }

    if (typeof value === "string") {
        const trimmedValue: string = value.trim();

        if (trimmedValue.length > 0) {
            return trimmedValue;
        }
    }

    return null;
};

const getRenderedFields = (
    school: School,
    section: SchoolSection,
    labels: Record<SchoolFieldLabelKey, string>,
): RenderedField[] => {
    return section.fields.flatMap((field): RenderedField[] => {
        const value: string | null = formatFieldValue(school[field.key]);

        if (!value) return [];

        return [
            {
                key: field.key,
                label: labels[field.labelKey],
                value,
            },
        ];
    });
};

export default (): React.JSX.Element => {
    const router: Router = useRouter();

    const colors: Colors = useColors();

    const lang: SchoolLang = useSchoolLang();

    const { schools } = useIntlayer("common");

    const schoolDetails = schools.detail;

    const { id } = useLocalSearchParams<{
        id?: string | string[];
    }>();

    const schoolId: string | undefined = getSchoolIdParam(id);

    const { school } = useQuery();

    const data: Maybe<School> = schoolId
        ? school({
              lang,
              schoolId,
          })
        : null;

    if (!schoolId) {
        return (
            <Container $colors={colors}>
                <ContentContainer>
                    <EmptyCard $colors={colors}>
                        <Title $colors={colors}>
                            {schoolDetails.missingIdTitle}
                        </Title>
                        <Description $colors={colors}>
                            {schoolDetails.missingIdDescription}
                        </Description>
                    </EmptyCard>
                </ContentContainer>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container $colors={colors}>
                <ContentContainer>
                    <EmptyCard $colors={colors}>
                        <Title $colors={colors}>
                            {schoolDetails.notFoundTitle}
                        </Title>
                        <Description $colors={colors}>
                            {schoolDetails.notFoundDescription}
                        </Description>
                    </EmptyCard>
                </ContentContainer>
            </Container>
        );
    }

    const schoolName: string =
        formatFieldValue(data.name) ?? schoolDetails.unavailable;

    const schoolAddress: string =
        formatFieldValue(data.address) ?? schoolDetails.unavailable;

    const fieldLabels: Record<SchoolFieldLabelKey, string> = {
        category: schoolDetails.fields.category,
        level: schoolDetails.fields.level,
        district: schoolDetails.fields.district,
        financeType: schoolDetails.fields.financeType,
        session: schoolDetails.fields.session,
        studentsGender: schoolDetails.fields.studentsGender,
        language: schoolDetails.fields.language,
        address: schoolDetails.fields.address,
        telephone: schoolDetails.fields.telephone,
        fax: schoolDetails.fields.fax,
        latitude: schoolDetails.fields.latitude,
        longitude: schoolDetails.fields.longitude,
        easting: schoolDetails.fields.easting,
        northing: schoolDetails.fields.northing,
    };

    const sectionTitles: Record<SchoolSectionTitleKey, string> = {
        profile: schoolDetails.sections.profile,
        contact: schoolDetails.sections.contact,
        coordinates: schoolDetails.sections.coordinates,
    };

    const sections = SCHOOL_SECTIONS.flatMap((section): React.JSX.Element[] => {
        const fields: RenderedField[] = getRenderedFields(
            data,
            section,
            fieldLabels,
        );

        if (fields.length === 0) return [];

        return [
            <React.Fragment key={section.titleKey}>
                <SectionTitle $colors={colors}>
                    {sectionTitles[section.titleKey]}
                </SectionTitle>
                <SectionCard $colors={colors}>
                    {fields.map(
                        (
                            field: RenderedField,
                            index: number,
                        ): React.JSX.Element => (
                            <FieldRow
                                key={field.key}
                                $colors={colors}
                                $withBorder={index > 0}
                            >
                                <FieldLabel $colors={colors}>
                                    {field.label}
                                </FieldLabel>
                                <FieldValue $colors={colors}>
                                    {field.value}
                                </FieldValue>
                            </FieldRow>
                        ),
                    )}
                </SectionCard>
                <Blank height={20} />
            </React.Fragment>,
        ];
    });

    return (
        <Container $colors={colors}>
            <ScrollView
                style={{
                    flex: 1,
                }}
                contentContainerStyle={{
                    padding: 20,
                }}
            >
                <ContentContainer>
                    <Blank height={20 + 40} />

                    <HeroCard $colors={colors}>
                        <Eyebrow $colors={colors}>
                            {schoolDetails.title}
                        </Eyebrow>
                        <Title $colors={colors}>{schoolName}</Title>
                        <Blank height={12} />
                        <Description $colors={colors}>
                            {schoolAddress}
                        </Description>
                    </HeroCard>

                    <Blank height={20} />

                    {sections.length > 0 ? (
                        sections
                    ) : (
                        <EmptyCard $colors={colors}>
                            <Description $colors={colors}>
                                {schoolDetails.noDetails}
                            </Description>
                        </EmptyCard>
                    )}
                </ContentContainer>
            </ScrollView>
            <CloseButton
                $colors={colors}
                onPress={(): void => router.dismiss()}
                style={({ pressed }): ViewStyle[] => [
                    {
                        backgroundColor: pressed ? colors.bg3 : colors.bg2,
                    },
                ]}
            >
                <X color={colors.text} />
            </CloseButton>
        </Container>
    );
};

const Container = styled.View<{
    $colors: Colors;
}>((props) => ({
    flex: 1,
    backgroundColor: props.$colors.bg1,
}));

const ContentContainer = styled.View({
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
});

const CloseButton = styled.Pressable<{
    $colors: Colors;
}>((props) => ({
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 2,
    cursor: "pointer",
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "100%",
    borderColor: props.$colors.bg3,
    borderWidth: 0.4,
    transitionProperty: "background-color",
    transitionDuration: "0.2s",
}));

const HeroCard = styled.View<{
    $colors: Colors;
}>((props) => ({
    width: "100%",
    backgroundColor: props.$colors.bg2,
    borderRadius: 20,
    padding: 20,
}));

const SectionCard = styled.View<{
    $colors: Colors;
}>((props) => ({
    width: "100%",
    backgroundColor: props.$colors.bg2,
    borderRadius: 20,
    overflow: "hidden",
}));

const EmptyCard = styled.View<{
    $colors: Colors;
}>((props) => ({
    width: "100%",
    backgroundColor: props.$colors.bg2,
    borderRadius: 20,
    padding: 20,
}));

const Eyebrow = styled.Text<{
    $colors: Colors;
}>((props) => ({
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: props.$colors.accent,
    textTransform: "uppercase",
}));

const Title = styled.Text<{
    $colors: Colors;
}>((props) => ({
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    color: props.$colors.text,
}));

const Description = styled.Text<{
    $colors: Colors;
}>((props) => ({
    fontSize: 16,
    lineHeight: 24,
    color: props.$colors.textSecondary,
}));

const SectionTitle = styled.Text<{
    $colors: Colors;
}>((props) => ({
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 18,
    fontWeight: "700",
    color: props.$colors.text,
}));

const FieldRow = styled.View<{
    $colors: Colors;
    $withBorder: boolean;
}>((props) => ({
    width: "100%",
    padding: 16,
    borderTopWidth: props.$withBorder ? 1 : 0,
    borderTopColor: props.$colors.bg3,
}));

const FieldLabel = styled.Text<{
    $colors: Colors;
}>((props) => ({
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: props.$colors.textSecondary,
    textTransform: "uppercase",
}));

const FieldValue = styled.Text<{
    $colors: Colors;
}>((props) => ({
    marginTop: 6,
    fontSize: 17,
    lineHeight: 24,
    color: props.$colors.text,
}));

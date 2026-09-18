from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=1000, allow_blank=False)


class ChatResponseSerializer(serializers.Serializer):
    answer = serializers.CharField()
    grounded = serializers.BooleanField()
    sources = serializers.ListField(child=serializers.DictField(), default=list)
